import { App, CachedMetadata, TFile, getAllTags, moment, parseFrontMatterAliases } from 'obsidian';

export interface FilePreview {
    mtime: number;
    ctime: number;
    excerpt: string;
    tags: string[];
    aliases: string[];
    imagePath: string | null;
    frontmatter: Record<string, unknown> | null;
}

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'avif'];
const EXCERPT_MAX_LENGTH = 300;
// Only the beginning of a note is needed for the excerpt, this bounds the regex work for long notes
const CONTENT_SCAN_LENGTH = 3000;

const cache = new Map<string, FilePreview>();
const pending = new Map<string, Promise<FilePreview>>();
const listeners = new Map<string, Set<() => void>>();

export const isImageExtension = (extension: string) => IMAGE_EXTENSIONS.includes(extension.toLowerCase());

// Returns the cached preview if it is still valid for the file's current modification time
export const peekPreview = (path: string, app: App): FilePreview | null => {
    const file = app.vault.getAbstractFileByPath(path);
    const cached = cache.get(path);
    if (!(file instanceof TFile) || !cached || cached.mtime !== file.stat.mtime) return null;
    return cached;
};

export const getPreview = (path: string, app: App): Promise<FilePreview | null> => {
    const cached = peekPreview(path, app);
    if (cached) return Promise.resolve(cached);
    if (pending.has(path)) return pending.get(path);

    const file = app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) return Promise.resolve(null);

    const promise = buildPreview(file, app)
        .then((preview) => {
            cache.set(path, preview);
            return preview;
        })
        .finally(() => pending.delete(path));
    pending.set(path, promise);
    return promise;
};

export const subscribePreview = (path: string, callback: () => void) => {
    if (!listeners.has(path)) listeners.set(path, new Set());
    listeners.get(path).add(callback);
    return () => {
        const pathListeners = listeners.get(path);
        pathListeners?.delete(callback);
        if (pathListeners?.size === 0) listeners.delete(path);
    };
};

// Called from metadata cache 'changed' events: drops the stale entry and lets visible rows reload
export const invalidatePreview = (path: string) => {
    cache.delete(path);
    listeners.get(path)?.forEach((callback) => callback());
};

export const removePreview = (path: string) => cache.delete(path);

export const clearPreviewCache = () => cache.clear();

const buildPreview = async (file: TFile, app: App): Promise<FilePreview> => {
    const preview: FilePreview = {
        mtime: file.stat.mtime,
        ctime: file.stat.ctime,
        excerpt: '',
        tags: [],
        aliases: [],
        imagePath: null,
        frontmatter: null,
    };

    if (isImageExtension(file.extension)) {
        preview.imagePath = file.path;
        return preview;
    }
    if (file.extension !== 'md') return preview;

    const metadata = app.metadataCache.getFileCache(file);
    const content = await app.vault.cachedRead(file);

    preview.excerpt = extractExcerpt(content, metadata, file.basename);
    if (metadata) {
        preview.tags = Array.from(new Set(getAllTags(metadata) ?? []));
        preview.aliases = (parseFrontMatterAliases(metadata.frontmatter) ?? []).map((alias) => String(alias).trim()).filter((alias) => alias !== '');
        preview.imagePath = getFirstImagePath(file, metadata, app);
        preview.frontmatter = metadata.frontmatter ?? null;
    }
    return preview;
};

const getFirstImagePath = (file: TFile, metadata: CachedMetadata, app: App): string | null => {
    for (const embed of metadata.embeds ?? []) {
        const linkPath = embed.link.split('#')[0];
        const target = app.metadataCache.getFirstLinkpathDest(linkPath, file.path);
        if (target && isImageExtension(target.extension)) return target.path;
    }
    return null;
};

export const extractExcerpt = (content: string, metadata: CachedMetadata | null, basename: string): string => {
    // Remove frontmatter
    const frontmatterEnd = metadata?.frontmatterPosition?.end.offset ?? metadata?.frontmatter?.position?.end.offset;
    let body = frontmatterEnd ? content.slice(frontmatterEnd) : content.replace(/^---\r?\n[\s\S]*?\r?\n---(\r?\n|$)/, '');
    body = body.slice(0, CONTENT_SCAN_LENGTH);

    // Drop the first heading if it only repeats the file name
    const lines = body.split(/\r?\n/);
    const firstLineIndex = lines.findIndex((line) => line.trim() !== '');
    if (firstLineIndex !== -1) {
        const heading = lines[firstLineIndex].match(/^#\s+(.*)$/);
        if (heading && heading[1].trim() === basename.trim()) lines.splice(firstLineIndex, 1);
    }

    const excerpt = lines
        .join('\n')
        .replace(/```[\s\S]*?(```|$)/g, ' ') // code blocks
        .replace(/%%[\s\S]*?(%%|$)/g, ' ') // obsidian comments
        .replace(/<!--[\s\S]*?(-->|$)/g, ' ') // html comments
        .replace(/!\[\[[^\]]*\]\]/g, ' ') // wiki embeds
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // markdown images
        .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1') // wiki links -> alias or name
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // markdown links -> text
        .replace(/<[^>]+>/g, ' ') // html tags
        .replace(/^\s*>\s*\[![^\]]*\][+-]?/gm, '') // callout markers
        .replace(/^\s*([-*_]\s*){3,}$/gm, ' ') // horizontal rules
        .replace(/^\s*\|?(\s*:?-+:?\s*\|)+\s*:?-*:?\s*$/gm, ' ') // table separators
        .replace(/^\s{0,3}(#{1,6}\s+|>+\s?|[-*+]\s+(\[.\]\s+)?|\d+[.)]\s+)/gm, '') // headings, quotes, lists, tasks
        .replace(/\s\^[\w-]+$/gm, '') // block ids
        .replace(/(\*\*|__|~~|==|`)/g, '') // emphasis
        .replace(/\|/g, ' ') // table pipes
        .replace(/\s+/g, ' ')
        .trim();

    return excerpt.length > EXCERPT_MAX_LENGTH ? excerpt.slice(0, EXCERPT_MAX_LENGTH) : excerpt;
};

// Turns a frontmatter value into display text: lists are joined, links show their alias or name, objects are skipped
export const formatPropertyValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.map(formatPropertyValue).filter((v) => v !== '').join(', ');
    if (typeof value === 'object') return '';
    return String(value)
        .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1')
        .trim();
};

// Property names are case insensitive in Obsidian
export const getPropertyValue = (frontmatter: Record<string, unknown> | null, key: string): string => {
    if (!frontmatter || !key) return '';
    const matchingKey = Object.keys(frontmatter).find((k) => k.toLowerCase() === key.toLowerCase());
    return matchingKey ? formatPropertyValue(frontmatter[matchingKey]) : '';
};

// The obsidian typings export moment as a namespace, the runtime value is the callable moment function
const momentFn = moment as unknown as (input?: number) => import('moment').Moment;

// Mail-app style date: time for today, weekday within the last week, short date otherwise
export const formatPreviewDate = (timestamp: number): string => {
    const date = momentFn(timestamp);
    const now = momentFn();
    if (date.isSame(now, 'day')) return date.format('LT');
    if (now.diff(date, 'days') < 7 && date.isBefore(now)) return date.format('ddd');
    if (date.isSame(now, 'year')) return date.format('MMM D');
    return date.format('ll');
};

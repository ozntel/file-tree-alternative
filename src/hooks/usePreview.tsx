import { useEffect, useState } from 'react';
import { App } from 'obsidian';
import * as PreviewCache from 'utils/previewCache';

// Loads the preview of a file once its row is mounted and reloads it when the note changes
export default function usePreview(path: string, app: App) {
    const [preview, setPreview] = useState<PreviewCache.FilePreview | null>(() => PreviewCache.peekPreview(path, app));

    useEffect(() => {
        let cancelled = false;
        const load = () => {
            PreviewCache.getPreview(path, app).then((result) => {
                if (!cancelled) setPreview(result);
            });
        };
        load();
        const unsubscribe = PreviewCache.subscribePreview(path, load);
        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, [path]);

    return preview;
}

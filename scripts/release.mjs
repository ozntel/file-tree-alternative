#!/usr/bin/env node
/*
 * Prepares a release pull request.
 *
 *   npm run release -- <patch|minor|major|x.y.z> [--dry-run]
 *
 * 1. Bumps the version in package.json, manifest.json and versions.json
 * 2. Adds a "## Version x.y.z" section to Releases.md (generated from the branch commits) unless it already exists
 * 3. Commits "v.x.y.z Release", pushes the branch and opens a pull request to main
 *
 * Once the pull request is merged, .github/workflows/release.yml builds the plugin and publishes the GitHub release.
 */
import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const BASE_BRANCH = 'main';
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const versionArg = args.find((a) => !a.startsWith('--'));

const run = (cmd, cmdArgs, options = {}) => execFileSync(cmd, cmdArgs, { encoding: 'utf8', ...options }).trim();
const git = (...gitArgs) => run('git', gitArgs);
const fail = (message) => {
    console.error(`\n✖ ${message}\n`);
    process.exit(1);
};

const commandExists = (cmd) => {
    try {
        run(cmd, ['--version'], { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
};

// Keep each file's own indentation and line endings (manifest.json uses CRLF)
const readJson = (path) => {
    const raw = readFileSync(path, 'utf8');
    const eol = raw.includes('\r\n') ? '\r\n' : '\n';
    const indent = raw.match(/^[ \t]+(?=")/m)?.[0] ?? '    ';
    return { data: JSON.parse(raw), eol, indent };
};
const writeJson = (path, { data, eol, indent }) => {
    const text = JSON.stringify(data, null, indent).replace(/\n/g, eol) + eol;
    if (!dryRun) writeFileSync(path, text);
};

const parseVersion = (v) => {
    const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(v);
    return match ? match.slice(1).map(Number) : null;
};
const isGreater = (a, b) => {
    for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
    return false;
};

/* ------------- Checks ------------- */

if (!versionArg) fail('Usage: npm run release -- <patch|minor|major|x.y.z> [--dry-run]');
if (!dryRun && git('status', '--porcelain', '--untracked-files=no') !== '') fail('Commit or stash your changes first, the working tree must be clean.');

const manifest = readJson('manifest.json');
const currentVersion = manifest.data.version;
const current = parseVersion(currentVersion);

let nextVersion;
if (['patch', 'minor', 'major'].includes(versionArg)) {
    const [major, minor, patch] = current;
    nextVersion = { patch: `${major}.${minor}.${patch + 1}`, minor: `${major}.${minor + 1}.0`, major: `${major + 1}.0.0` }[versionArg];
} else {
    nextVersion = versionArg.replace(/^v\.?/, '');
}
const next = parseVersion(nextVersion);
if (!next) fail(`"${versionArg}" is not a valid version, use patch, minor, major or x.y.z`);
if (!isGreater(next, current)) fail(`New version ${nextVersion} must be greater than the current version ${currentVersion}`);

git('fetch', '--quiet', '--tags', 'origin', BASE_BRANCH);
if (git('tag', '--list', nextVersion) !== '') fail(`Tag ${nextVersion} already exists`);

/* ------------- Branch ------------- */

let branch = git('rev-parse', '--abbrev-ref', 'HEAD');
if (branch === BASE_BRANCH) {
    branch = `release/${nextVersion}`;
    console.log(`On ${BASE_BRANCH}, creating branch ${branch}`);
    if (!dryRun) git('checkout', '-b', branch);
}

/* ------------- Version files ------------- */

manifest.data.version = nextVersion;
writeJson('manifest.json', manifest);

const pkg = readJson('package.json');
pkg.data.version = nextVersion;
writeJson('package.json', pkg);

// Newest version first, the way versions.json is kept
const versions = readJson('versions.json');
versions.data = { [nextVersion]: manifest.data.minAppVersion, ...versions.data };
writeJson('versions.json', versions);

/* ------------- Release notes ------------- */

const releasesRaw = readFileSync('Releases.md', 'utf8');
const releasesEol = releasesRaw.includes('\r\n') ? '\r\n' : '\n';
const sectionHeading = `## Version ${nextVersion}`;
let notes;

if (releasesRaw.split(/\r?\n/).some((line) => line.trim() === sectionHeading)) {
    notes = extractNotes(releasesRaw, nextVersion);
    console.log(`Releases.md already has "${sectionHeading}", keeping it`);
} else {
    const commits = git('log', '--no-merges', '--format=%s', `origin/${BASE_BRANCH}..HEAD`)
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s !== '' && !/^v\.?\d+\.\d+\.\d+ Release$/i.test(s));
    const unique = [...new Set(commits)].reverse();
    if (unique.length === 0) unique.push('Maintenance release');
    notes = unique.map((s) => `- ${s}`).join('\n');

    const updated = releasesRaw.replace(/^(# Release Updates\r?\n)/, `$1${releasesEol}${sectionHeading}${releasesEol}${releasesEol}${notes.replace(/\n/g, releasesEol)}${releasesEol}`);
    if (updated === releasesRaw) fail('Could not find "# Release Updates" heading in Releases.md');
    if (!dryRun) writeFileSync('Releases.md', updated);
    console.log(`${dryRun ? 'Would add' : 'Added'} "${sectionHeading}" to Releases.md from the branch commits, edit it in the PR if needed`);
}

function extractNotes(text, version) {
    const lines = text.split(/\r?\n/);
    const start = lines.findIndex((line) => line.trim() === `## Version ${version}`);
    const end = lines.findIndex((line, i) => i > start && line.startsWith('## '));
    return lines
        .slice(start + 1, end === -1 ? undefined : end)
        .join('\n')
        .trim();
}

console.log(`\nVersion ${currentVersion} → ${nextVersion} on branch ${branch}\n\n${notes}\n`);

if (dryRun) {
    console.log('Dry run: no files were changed, nothing was committed or pushed.');
    process.exit(0);
}

/* ------------- Commit, push, pull request ------------- */

git('add', 'manifest.json', 'package.json', 'versions.json', 'Releases.md');
git('commit', '--quiet', '-m', `v.${nextVersion} Release`);
git('push', '--quiet', '--set-upstream', 'origin', branch);
console.log(`Pushed ${branch}`);

const title = `Release ${nextVersion}`;
const body = `## Version ${nextVersion}\n\n${notes}\n\n---\nMerging this pull request builds the plugin and publishes the \`${nextVersion}\` GitHub release with \`main.js\`, \`manifest.json\` and \`styles.css\`.\nRelease notes are taken from \`Releases.md\` at merge time, so edits made there in this PR are included.`;

if (commandExists('gh')) {
    const url = run('gh', ['pr', 'create', '--base', BASE_BRANCH, '--head', branch, '--title', title, '--body', body]);
    console.log(`\n✔ Pull request created: ${url}\n`);
} else {
    const remote = git('remote', 'get-url', 'origin')
        .replace(/^git@github\.com:/, 'https://github.com/')
        .replace(/\.git$/, '');
    const url = `${remote}/compare/${BASE_BRANCH}...${encodeURIComponent(branch)}?expand=1&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    console.log(`\nGitHub CLI (gh) is not installed, open this link to create the pull request:\n\n${url}\n`);
    console.log('Install it with "brew install gh" and run "gh auth login" to create pull requests automatically next time.\n');
}

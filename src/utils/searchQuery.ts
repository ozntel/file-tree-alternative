import { prepareFuzzySearch } from 'obsidian';

// Search query syntax:
//   space        -> AND   e.g. "west rewards"      both terms must match
//   | or OR      -> OR    e.g. "west | rewards"    either side may match
//   -term        -> NOT   e.g. "west -rewards"     term must not match
//   "two words"  -> keeps the quoted text together as a single term
// AND binds tighter than OR, so "a b | c" means (a AND b) OR c.

type Term = { text: string; negate: boolean };
type Query = Term[][]; // OR of AND-groups

const tokenize = (query: string): string[] => {
    const tokens: string[] = [];
    const tokenRegex = /(-?)"([^"]*)"?|(\S+)/g;
    let match: RegExpExecArray | null;
    while ((match = tokenRegex.exec(query)) !== null) {
        if (match[3] !== undefined) tokens.push(match[3]);
        else if (match[2].trim().length > 0) tokens.push(`${match[1]}"${match[2]}"`);
    }
    return tokens;
};

export const parseSearchQuery = (query: string): Query => {
    const groups: Query = [[]];
    for (const token of tokenize(query)) {
        if (token === '|' || token === 'OR') {
            groups.push([]);
            continue;
        }
        const negate = token.startsWith('-') && token.length > 1;
        let text = negate ? token.slice(1) : token;
        if (text.startsWith('"')) text = text.slice(1, -1);
        if (text.length === 0) continue;
        groups[groups.length - 1].push({ text, negate });
    }
    return groups.filter((group) => group.length > 0);
};

// Returns a predicate that tests a list of candidate strings (e.g. a file name, or a file's tags)
// against the query. A term matches if it matches any of the candidates.
// An empty query matches everything.
export const prepareQueryMatcher = (query: string, termMatches?: (term: string) => (candidate: string) => boolean) => {
    const makeTermMatcher = termMatches ?? ((term: string) => {
        const fuzzy = prepareFuzzySearch(term);
        return (candidate: string) => fuzzy(candidate) !== null;
    });
    const groups = parseSearchQuery(query).map((group) =>
        group.map((term) => ({ negate: term.negate, test: makeTermMatcher(term.text) }))
    );
    if (groups.length === 0) return (_candidates: string[]) => true;
    return (candidates: string[]) =>
        groups.some((group) => group.every((term) => candidates.some((c) => term.test(c)) !== term.negate));
};

import { conceptGraph, type LinkItem } from "./links-data";

export type SearchMatch = {
  linkId: string;
  /** Context label, e.g. role title or project name. */
  label: string;
  /** Specific, descriptive sentence about why this matches. */
  explanation: string;
  score: number;
};

export type SearchResult = {
  query: string;
  matches: SearchMatch[];
  summary: string;
};

/** Build a reverse index: term -> set of canonical concepts it implies. */
const termToConcepts: Map<string, Set<string>> = (() => {
  const map = new Map<string, Set<string>>();
  for (const [concept, terms] of Object.entries(conceptGraph)) {
    const all = new Set([concept, ...terms]);
    for (const term of all) {
      const key = term.toLowerCase();
      if (!map.has(key)) map.set(key, new Set());
      map.get(key)!.add(concept);
    }
  }
  return map;
})();

/** Resolve a query string into a weighted bag of canonical concepts. */
function inferConcepts(query: string): Map<string, number> {
  const q = query.toLowerCase();
  const concepts = new Map<string, number>();
  const bump = (c: string, w: number) => concepts.set(c, (concepts.get(c) ?? 0) + w);

  // 1. Phrase matches (longer terms first) — strongest signal.
  const phrases = Array.from(termToConcepts.keys()).sort(
    (a, b) => b.length - a.length,
  );
  for (const phrase of phrases) {
    if (phrase.includes(" ") || phrase.includes("-")) {
      if (q.includes(phrase)) {
        for (const c of termToConcepts.get(phrase)!) bump(c, 3);
      }
    }
  }

  // 2. Token matches — tokenize on non-word boundaries.
  const tokens = q.split(/[^a-z0-9+]+/i).filter((t) => t.length > 1);
  for (const token of tokens) {
    const direct = termToConcepts.get(token);
    if (direct) {
      for (const c of direct) bump(c, 2);
      continue;
    }
    // Fuzzy: substring against known terms (catches "debugg" → "debugging").
    for (const [term, cs] of termToConcepts) {
      if (term.length < 4) continue;
      if (term.includes(token) || token.includes(term)) {
        for (const c of cs) bump(c, 1);
      }
    }
  }

  return concepts;
}

/**
 * Score every facet of every link against the inferred concepts.
 * Returns the best facet per link (so we never duplicate a link).
 */
export function searchLinks(query: string, links: LinkItem[]): SearchResult {
  const cleaned = query.trim();
  if (!cleaned) return { query, matches: [], summary: "" };

  const wanted = inferConcepts(cleaned);
  const matches: SearchMatch[] = [];

  for (const link of links) {
    let best: { facet: (typeof link.facets)[number]; score: number } | null = null;
    for (const facet of link.facets) {
      let score = 0;
      for (const concept of facet.concepts) {
        score += wanted.get(concept) ?? 0;
      }
      if (score > 0 && (!best || score > best.score)) {
        best = { facet, score };
      }
    }
    if (best) {
      matches.push({
        linkId: link.id,
        label: best.facet.label,
        explanation: best.facet.explanation,
        score: best.score,
      });
    }
  }

  matches.sort((a, b) => b.score - a.score);

  const summary =
    matches.length === 0
      ? `No clear matches for "${cleaned}". Try terms like "debugging", "Kubernetes", or "frontend".`
      : matches.length === 1
        ? `Found 1 relevant link for "${cleaned}".`
        : `Found ${matches.length} relevant links for "${cleaned}".`;

  return { query: cleaned, matches, summary };
}
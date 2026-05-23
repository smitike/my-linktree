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

  // Hardcoded deterministic mappings for specific queries requested by the user.
  const lc = cleaned.toLowerCase();
  if (lc === "can-bus" || lc.includes("can-bus") || lc.includes("can bus") || lc.includes("canbus")) {
    const resume = links.find((l) => l.id === "resume");
    if (resume) {
      return {
        query: cleaned,
        matches: [
          {
            linkId: resume.id,
            label: "Software Engineer Inten",
            explanation:
              "Worked on CAN-bus diagnostic and automatically error reporting service.",
            score: 999,
          },
        ],
        summary: `Found 1 relevant link for "${cleaned}".`,
      };
    }
  }
  if (lc === "hackathon" || lc.includes("hackathon")) {
    const hack = links.find((l) => l.id === "hackathon");
    if (hack) {
      return {
        query: cleaned,
        matches: [
          {
            linkId: hack.id,
            label: "Contributed on frontend",
            explanation:
              "Built a security camera with Nemoclaw LLM for specific commands and alerts.",
            score: 999,
          },
        ],
        summary: `Found 1 relevant link for "${cleaned}".`,
      };
    }
  }
  // Explicit mapping for the phrase "debugging skills" per user request.
  if (lc === "debugging skills" || lc.includes("debugging skills")) {
    const resume = links.find((l) => l.id === "resume");
    if (resume) {
      return {
        query: cleaned,
        matches: [
          {
            linkId: resume.id,
            label: "Software Engineer Intern",
            explanation:
              "Helped 6+ customers troubleshoot issues with their robots.",
            score: 998,
          },
        ],
        summary: `Found 1 relevant link for "${cleaned}".`,
      };
    }
  }
  // Hardcoded mapping for GNN experience queries: match resume, research, and github.
  if (
    lc === "experience working with gnn models" ||
    lc.includes("experience working with gnn") ||
    lc.includes("experience with gnn") ||
    lc.includes("gnn models")
  ) {
    const matches = [] as SearchMatch[];
    const resume = links.find((l) => l.id === "resume");
    const research = links.find((l) => l.id === "research");
    const github = links.find((l) => l.id === "github");
    if (resume) {
      matches.push({
        linkId: resume.id,
        label: "Research Fellow",
        explanation:
          "Improved GAT mode classification accracy by 15%.",
        score: 999,
      });
    }
    if (research) {
      matches.push({
        linkId: research.id,
        label: "Co-authored",
        explanation:
          "Compared GAT model performance with Feedforward for network intrusion detection and classification.",
        score: 999,
      });
      matches.push({
        linkId: research.id,
        label: "Methodology",
        explanation:
          "GAT model for Cora dataset was adapted for use with Smart Home Network dataset.",
        score: 997,
      });
    }
    if (github) {
      matches.push({
        linkId: github.id,
        label: "Repository",
        explanation:
          "Contains GAT model implementations and experiments used in the associated research.",
        score: 996,
      });
    }
    return {
      query: cleaned,
      matches,
      summary: `Found ${matches.length} relevant links for "${cleaned}".`,
    };
  }

  // Hardcoded mapping for "Working with robots" to match resume and LinkedIn.
  if (lc === "working with robots" || lc.includes("working with robots") || lc.includes("robots")) {
    const matches = [] as SearchMatch[];
    const resume = links.find((l) => l.id === "resume");
    const linkedin = links.find((l) => l.id === "linkedin");
    if (resume) {
      matches.push({
        linkId: resume.id,
        label: "Software Engineer Intern",
        explanation: "Built a diagnostic service for robotic systems.",
        score: 999,
      });
    }
    if (linkedin) {
      matches.push({
        linkId: linkedin.id,
        label: "Post from 08/2025",
        explanation: "Posted experience on working with Amiga robots.",
        score: 998,
      });
    }
    return {
      query: cleaned,
      matches,
      summary: `Found ${matches.length} relevant links for "${cleaned}".`,
    };
  }

  const wanted = inferConcepts(cleaned);
  const matches: SearchMatch[] = [];

  for (const link of links) {
    let best: { facet: (typeof link.facets)[number]; score: number } | null = null;
    for (const facet of link.facets) {
      let score = 0;
      for (const concept of facet.concepts) {
        score += wanted.get(concept) ?? 0;
      }
      // Note: metadata-based boosts removed; using only facet concepts and hardcoded mappings.
      if (score > 0 && (!best || score > best.score)) {
        best = { facet, score };
      }
    }
    if (best) {
      // Build explanation from the matching facet only (no metadata/snippets).
      const matchedConcepts: string[] = [];
      for (const c of best.facet.concepts) {
        if ((wanted.get(c) ?? 0) > 0) matchedConcepts.push(c);
      }

      let explanation = best.facet.explanation;
      if (matchedConcepts.length) {
        explanation = `Related to ${matchedConcepts.join(", ")}: ${explanation}`;
      }

      matches.push({
        linkId: link.id,
        label: best.facet.label,
        explanation,
        score: best.score,
      });
    }
  }

  matches.sort((a, b) => b.score - a.score);

  const summary =
    matches.length === 0
      ? `No clear matches for "${cleaned}". Try terms like "debugging", "frontend", or "Experience with GNN".`
      : matches.length === 1
        ? `Found 1 relevant link for "${cleaned}".`
        : `Found ${matches.length} relevant links for "${cleaned}".`;

  return { query: cleaned, matches, summary };
}
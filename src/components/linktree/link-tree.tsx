import { useMemo, useState, useEffect } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { ProfileHeader } from "./profile-header";
import { SmartSearchBar } from "./smart-search-bar";
import { LinkCard } from "./link-card";
import { links } from "./links-data";
import { searchLinks, type SearchResult } from "./smart-search";

export function LinkTree() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [, setTick] = useState(0);
  const [zoom, setZoom] = useState(1);

  // Fetch server-side metadata for links once (populates links.meta)
  // Server-side metadata fetching disabled — using mocked/facet data only.

  const matchMap = useMemo(() => {
    const map = new Map<string, { label: string; explanation: string }[]>();
    result?.matches.forEach((m) => {
      const current = map.get(m.linkId) ?? [];
      current.push({ label: m.label, explanation: m.explanation });
      map.set(m.linkId, current);
    });
    return map;
  }, [result]);

  const hasMatches = (result?.matches.length ?? 0) > 0;

  const runSearch = (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResult(null);
      return;
    }
    setIsThinking(true);
    // Simulate AI thinking latency for the animation to land.
    window.setTimeout(() => {
      setResult(searchLinks(q, links));
      setIsThinking(false);
    }, 420);
  };

  const clear = () => {
    setQuery("");
    setResult(null);
  };

  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col gap-8 px-5 pb-16 pt-12 sm:px-6 sm:pt-16"
      style={{ zoom }}
    >
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
        <button
          aria-label="Zoom out"
          onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))}
          className="rounded-md bg-card/70 p-2 text-muted-foreground shadow-md hover:bg-card"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          aria-label="Zoom in"
          onClick={() => setZoom((z) => Math.min(1.4, +(z + 0.1).toFixed(2)))}
          className="rounded-md bg-card/70 p-2 text-muted-foreground shadow-md hover:bg-card"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>
      <ProfileHeader />

      <SmartSearchBar
        value={query}
        onChange={setQuery}
        onSubmit={runSearch}
        onClear={clear}
        isThinking={isThinking}
        summary={result?.summary}
        hasResult={!!result}
      />

      <ul className="flex flex-col gap-3">
        {links.map((link, i) => {
          const matchEntries = matchMap.get(link.id);
          const highlighted = !!matchEntries?.length;
          const dimmed = !!result && hasMatches && !highlighted;
          return (
            <LinkCard
              key={link.id}
              link={link}
              index={i}
              highlighted={highlighted}
              dimmed={dimmed}
              matchEntries={matchEntries}
            />
          );
        })}
      </ul>

      <div className="mt-auto" />
    </main>
  );
}
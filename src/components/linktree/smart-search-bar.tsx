import { Search, Sparkles, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  onClear: () => void;
  isThinking: boolean;
  summary?: string;
  hasResult: boolean;
};

const suggestions = ["CAN-bus", "debugging", "Kubernetes", "Python", "Working with robots"];

export function SmartSearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  isThinking,
  summary,
  hasResult,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="w-full animate-fade-up" style={{ animationDelay: "60ms" }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(value);
        }}
        className={cn(
          "group relative flex items-center gap-2 rounded-2xl border bg-card/70 backdrop-blur-xl px-3 py-2 transition-all duration-[var(--transition-base)]",
          "shadow-[var(--shadow-soft)]",
          focused ? "border-primary/60 shadow-[var(--shadow-glow)]" : "border-border/70",
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          {isThinking ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Sparkles className="h-4 w-4 text-primary" />
          )}
        </span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        placeholder="Search for specific skill, experience, project,…"
          aria-label="Smart search"
          className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              onClear();
              inputRef.current?.focus();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          className="hidden sm:flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]"
        >
          <Search className="h-3.5 w-3.5" />
          Search
        </button>
        <kbd className="hidden md:inline-flex items-center rounded-md border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </form>

      {!hasResult && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSubmit(s)}
              className="rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground hover:bg-card"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {hasResult && summary && (
        <p
          className="mt-3 text-xs text-muted-foreground animate-fade-up"
          aria-live="polite"
        >
          <Sparkles className="mr-1 inline h-3 w-3 text-primary" />
          {summary}
        </p>
      )}
    </div>
  );
}
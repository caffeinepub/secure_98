import { useEffect, useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { Loader2, Search, X } from "lucide-react";
import { useAppStore } from "../stores/useAppStore";
import { useSearchMemories, useFamilyDependents } from "../hooks/useQueries";
import { AppHeader } from "./AppHeader";

interface SearchViewProps {
  familyId: bigint;
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-primary/20 text-foreground rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function SearchView({ familyId }: SearchViewProps) {
  const goToDay = useAppStore((s) => s.goToDay);
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: dependents, isError: isDependentsError } =
    useFamilyDependents(familyId);
  const {
    data: results,
    isLoading,
    isError,
  } = useSearchMemories(familyId, debouncedQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const memberMap = useMemo(() => {
    const map = new Map<string, string>();
    dependents?.forEach((d) => map.set(d.id.toString(), d.name));
    return map;
  }, [dependents]);

  const resolveTaggedMembers = (ids: bigint[]) =>
    ids
      .map((id) => ({
        id,
        name: memberMap.get(id.toString()) ?? "Unknown",
      }))
      .filter((m) => m.name !== "Unknown");

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <AppHeader title="Search" />

      <div className="mx-auto max-w-2xl">
        <div className="px-4 pt-2 pb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search"
              className="w-full h-10 rounded-2xl border border-border bg-muted/40 pl-10 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-border"
            />
            {inputValue && (
              <button
                onClick={() => {
                  setInputValue("");
                  inputRef.current?.focus();
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {!debouncedQuery && (
          <p className="text-center text-muted-foreground py-12 text-sm">
            Search by caption, milestone, or child/pet name.
          </p>
        )}

        {debouncedQuery && isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isDependentsError && (
          <p className="px-4 text-sm text-destructive">
            Failed to load family members.
          </p>
        )}

        {debouncedQuery && isError && (
          <p className="px-4 text-sm text-destructive">
            Failed to search memories.
          </p>
        )}

        {debouncedQuery &&
          !isLoading &&
          !isError &&
          results &&
          results.length === 0 && (
            <p className="text-center text-muted-foreground py-12 text-sm">
              No memories found for &ldquo;{debouncedQuery}&rdquo;.
            </p>
          )}

        {results && results.length > 0 && (
          <div className="divide-y divide-border/40">
            {results.map((memory) => {
              const tagged = resolveTaggedMembers(memory.taggedMemberIds);
              const firstMedia =
                memory.mediaBlobs.length > 0 ? memory.mediaBlobs[0] : null;
              const isVideo = memory.mediaTypes[0] === "video";
              const caption = memory.caption ?? null;

              return (
                <button
                  key={memory.id.toString()}
                  onClick={() => goToDay(memory.date)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent/30 transition-colors"
                >
                  {firstMedia && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted">
                      {isVideo ? (
                        <video
                          src={firstMedia.getDirectURL()}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={firstMedia.getDirectURL()}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {caption && (
                      <p className="text-[15px] line-clamp-2 leading-snug">
                        {highlightMatch(caption, debouncedQuery)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(parseISO(memory.date), "MMM d, yyyy")}
                      {tagged.length > 0 &&
                        ` \u00B7 ${tagged.map((m) => m.name).join(", ")}`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

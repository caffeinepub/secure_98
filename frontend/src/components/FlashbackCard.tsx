import { format, parse, differenceInYears } from "date-fns";
import { X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppStore } from "../stores/useAppStore";

interface FlashbackMemory {
  id: bigint;
  date: string;
  caption?: string;
  mediaBlobs: { getDirectURL: () => string }[];
  mediaTypes: string[];
}

interface FlashbackCardProps {
  memories: FlashbackMemory[];
}

export function FlashbackCard({ memories }: FlashbackCardProps) {
  const goToDay = useAppStore((s) => s.goToDay);
  const dismissFlashback = useAppStore((s) => s.dismissFlashback);

  if (memories.length === 0) return null;

  const today = new Date();
  const grouped = new Map<string, FlashbackMemory[]>();
  for (const memory of memories) {
    const existing = grouped.get(memory.date) ?? [];
    existing.push(memory);
    grouped.set(memory.date, existing);
  }

  const dates = [...grouped.keys()].sort();

  return (
    <div className="mx-2 my-3 rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <Clock className="h-4 w-4 text-primary" />
          On This Day
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={dismissFlashback}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex gap-2 px-3 pb-3 overflow-x-auto">
        {dates.map((date) => {
          const dateMemories = grouped.get(date)!;
          const parsed = parse(date, "yyyy-MM-dd", new Date());
          const yearsAgo = differenceInYears(today, parsed);
          const firstWithMedia = dateMemories.find(
            (m) => m.mediaBlobs.length > 0,
          );
          const firstCaption =
            dateMemories.find((m) => m.caption)?.caption ?? null;

          return (
            <button
              key={date}
              onClick={() => goToDay(date)}
              className={cn(
                "shrink-0 w-36 rounded-lg border border-border/30 overflow-hidden",
                "hover:border-primary/40 transition-colors cursor-pointer text-left",
              )}
            >
              {firstWithMedia ? (
                <div className="h-20 w-full bg-muted">
                  {firstWithMedia.mediaTypes[0] === "video" ? (
                    <video
                      src={firstWithMedia.mediaBlobs[0].getDirectURL()}
                      className="h-full w-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={firstWithMedia.mediaBlobs[0].getDirectURL()}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              ) : (
                <div className="h-20 w-full bg-muted flex items-center justify-center">
                  <Clock className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium text-primary">
                  {yearsAgo} {yearsAgo === 1 ? "year" : "years"} ago
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(parsed, "MMM d, yyyy")}
                </p>
                {firstCaption && (
                  <p className="text-xs text-foreground/70 mt-0.5 line-clamp-1">
                    {firstCaption}
                  </p>
                )}
                {dateMemories.length > 1 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    +{dateMemories.length - 1} more
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

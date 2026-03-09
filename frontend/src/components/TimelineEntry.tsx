import { Award } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { useMemoriesForMilestone } from "../hooks/useQueries";

interface TimelineEntryProps {
  familyId: bigint;
  memberId: bigint;
  milestoneKey: string;
  milestoneName: string;
  category: string | null;
  onClick: () => void;
}

export function TimelineEntry({
  familyId,
  memberId,
  milestoneKey,
  milestoneName,
  category,
  onClick,
}: TimelineEntryProps) {
  const { data: memories, isError } = useMemoriesForMilestone(
    familyId,
    memberId,
    milestoneKey,
  );

  const memoryCount = memories?.length ?? 0;
  const thumbnails = (memories ?? [])
    .filter((m) => m.mediaBlobs.length > 0)
    .slice(0, 3)
    .map((m) => m.mediaBlobs[0].getDirectURL());

  // Use earliest memory date as the achievement date
  const earliestDate =
    memories && memories.length > 0
      ? memories.reduce(
          (earliest, m) => (m.date < earliest ? m.date : earliest),
          memories[0].date,
        )
      : null;

  if (isError) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4 text-sm text-destructive">
          Failed to load milestone data.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          {thumbnails.length > 0 ? (
            <div className="relative w-14 h-14 shrink-0">
              <img
                src={thumbnails[0]}
                alt=""
                className="w-14 h-14 rounded-lg object-cover"
              />
              {thumbnails.length > 1 && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center">
                  +{thumbnails.length - 1}
                </div>
              )}
            </div>
          ) : (
            <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Award className="h-6 w-6 text-muted-foreground/50" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight">{milestoneName}</p>
            {category && (
              <p className="text-xs text-muted-foreground mt-0.5">{category}</p>
            )}
            {earliestDate && (
              <p className="text-xs text-muted-foreground mt-1">
                {format(parseISO(earliestDate), "MMM d, yyyy")}
              </p>
            )}
            {memoryCount > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {memoryCount} {memoryCount === 1 ? "moment" : "moments"}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

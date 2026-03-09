import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMemoriesForMilestone } from "../hooks/useQueries";

interface MilestoneRowProps {
  familyId: bigint;
  memberId: bigint;
  milestoneKey: string;
  milestoneName: string;
  ageRange: string | null;
  isCustom: boolean;
  isAchieved: boolean;
  canAddMeasurementsAndMilestones: boolean;
  onClick: () => void;
  onDelete?: () => void;
}

export function MilestoneRow({
  familyId,
  memberId,
  milestoneKey,
  milestoneName,
  ageRange,
  isCustom,
  isAchieved,
  canAddMeasurementsAndMilestones,
  onClick,
  onDelete,
}: MilestoneRowProps) {
  const { data: memories, isError } = useMemoriesForMilestone(
    isAchieved ? familyId : null,
    isAchieved ? memberId : null,
    isAchieved ? milestoneKey : null,
  );

  const memoryCount = memories?.length ?? 0;
  const thumbnailUrl = memories?.[0]?.mediaBlobs?.[0]?.getDirectURL() ?? null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 transition-colors cursor-pointer hover:bg-accent/50",
        isAchieved
          ? "border-primary/30 bg-primary/5"
          : "border-border/50 bg-card",
      )}
      onClick={onClick}
    >
      {isAchieved ? (
        <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
      ) : (
        <Circle className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground/40" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-tight",
              isAchieved && "text-primary font-medium",
            )}
          >
            {milestoneName}
          </p>
          {isCustom && canAddMeasurementsAndMilestones && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        {ageRange && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatAgeRange(ageRange)}
          </p>
        )}
        {isError && isAchieved && (
          <p className="text-xs text-destructive mt-1">
            Failed to load moments
          </p>
        )}
        {!isError && isAchieved && memoryCount > 0 && (
          <div className="flex items-center gap-2 mt-1.5">
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt=""
                className="w-10 h-10 rounded-md object-cover"
              />
            )}
            <span className="text-xs text-muted-foreground">
              {memoryCount} {memoryCount === 1 ? "moment" : "moments"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function formatAgeRange(range: string): string {
  const [min, max] = range.split("-").map(Number);
  if (max <= 12) return `${min}–${max} months`;
  return `${min / 12}–${max / 12} years`;
}

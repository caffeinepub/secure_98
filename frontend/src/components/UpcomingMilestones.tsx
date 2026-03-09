import { useMemo } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { parseISO, differenceInMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  useCustomMilestones,
  useAchievedMilestoneKeys,
} from "../hooks/useQueries";
import { MemberKind } from "../backend";
import { getPredefinedMilestones } from "../utils/milestones";

interface UpcomingMilestonesProps {
  familyId: bigint;
  memberId: bigint;
  memberKind: MemberKind;
  dateOfBirth: string | null;
  onSeeAll: () => void;
  onCaptureMilestone: (milestoneKey: string) => void;
  onViewMilestone: (milestoneKey: string) => void;
}

function getAgeRangeForMonths(months: number): string | null {
  if (months < 3) return "0-3";
  if (months < 6) return "3-6";
  if (months < 12) return "6-12";
  if (months < 24) return "12-24";
  if (months < 48) return "24-48";
  if (months < 72) return "48-72";
  return null;
}

function formatAgeRange(range: string): string {
  const [min, max] = range.split("-").map(Number);
  if (max <= 12) return `${min}–${max} months`;
  return `${min / 12}–${max / 12} years`;
}

export function UpcomingMilestones({
  familyId,
  memberId,
  memberKind,
  dateOfBirth,
  onSeeAll,
  onCaptureMilestone,
  onViewMilestone,
}: UpcomingMilestonesProps) {
  const predefined = getPredefinedMilestones(memberKind);
  const {
    data: custom,
    isLoading: isLoadingCustom,
    isError: isCustomError,
  } = useCustomMilestones(familyId, memberId);
  const {
    data: achievedKeysArray,
    isLoading: isLoadingAchievements,
    isError: isAchievementsError,
  } = useAchievedMilestoneKeys(familyId, memberId);

  const achievedKeys = useMemo(() => {
    if (!achievedKeysArray) return new Set<string>();
    return new Set(achievedKeysArray);
  }, [achievedKeysArray]);

  const ageMonths = useMemo(() => {
    if (!dateOfBirth) return null;
    return differenceInMonths(new Date(), parseISO(dateOfBirth));
  }, [dateOfBirth]);

  const currentAgeRange =
    memberKind === MemberKind.child && ageMonths !== null
      ? getAgeRangeForMonths(ageMonths)
      : null;

  const filteredMilestones = useMemo(() => {
    return [
      ...predefined.map((m) => ({
        key: m.key,
        name: m.name,
        category: m.category,
        ageRange: m.ageRange,
      })),
      ...(custom ?? []).map((m) => ({
        key: m.key,
        name: m.name,
        category: m.category,
        ageRange: null as string | null,
      })),
    ];
  }, [predefined, custom, memberKind, currentAgeRange]);

  // Group by category, sort: unachieved first, then achieved
  const grouped = useMemo(() => {
    const groups = new Map<
      string,
      Array<{ key: string; name: string; achieved: boolean }>
    >();
    for (const m of filteredMilestones) {
      const items = groups.get(m.category) ?? [];
      items.push({
        key: m.key,
        name: m.name,
        achieved: achievedKeys.has(m.key),
      });
      groups.set(m.category, items);
    }
    for (const [cat, items] of groups.entries()) {
      groups.set(
        cat,
        items.sort((a, b) => Number(a.achieved) - Number(b.achieved)),
      );
    }
    return groups;
  }, [filteredMilestones, achievedKeys]);

  const isLoading = isLoadingCustom || isLoadingAchievements;
  const isError = isCustomError || isAchievementsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-destructive py-4">
        Failed to load milestones.
      </div>
    );
  }

  if (grouped.size === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No milestones available for this age range.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Upcoming Milestones
          {currentAgeRange && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              ({formatAgeRange(currentAgeRange)})
            </span>
          )}
        </h2>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs font-medium gap-0.5"
          onClick={onSeeAll}
        >
          SEE ALL
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>

      {Array.from(grouped.entries()).map(([category, items]) => (
        <div key={category} className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            {category}
          </p>
          <div className="rounded-lg border border-border/50 overflow-hidden divide-y divide-border/30">
            {items.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  item.achieved
                    ? onViewMilestone(item.key)
                    : onCaptureMilestone(item.key)
                }
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                  item.achieved
                    ? "bg-primary/5 hover:bg-primary/10"
                    : "bg-card hover:bg-accent/30",
                )}
              >
                <span
                  className={cn(
                    "flex-1 text-sm leading-tight",
                    item.achieved
                      ? "text-primary font-medium"
                      : "text-foreground",
                  )}
                >
                  {item.name}
                </span>
                {item.achieved && (
                  <ChevronRight className="h-4 w-4 shrink-0 text-primary/50" />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

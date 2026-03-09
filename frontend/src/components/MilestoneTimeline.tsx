import { useMemo } from "react";
import { Clock, Loader2 } from "lucide-react";
import {
  useAchievedMilestoneKeys,
  useCustomMilestones,
  useFamilyDependents,
} from "../hooks/useQueries";
import { getPredefinedMilestones } from "../utils/milestones";
import { TimelineEntry } from "./TimelineEntry";
import { useAppStore } from "../stores/useAppStore";

interface MilestoneTimelineProps {
  familyId: bigint;
  memberId: bigint;
}

export function MilestoneTimeline({
  familyId,
  memberId,
}: MilestoneTimelineProps) {
  const goToMilestoneDetail = useAppStore((s) => s.goToMilestoneDetail);
  const { data: dependents, isError: isDependentsError } =
    useFamilyDependents(familyId);

  const memberKind = useMemo(() => {
    const dep = dependents?.find((d) => d.id === memberId);
    return dep?.kind ?? null;
  }, [dependents, memberId]);

  const {
    data: achievedKeys,
    isLoading: isLoadingKeys,
    isError: isKeysError,
  } = useAchievedMilestoneKeys(familyId, memberId);
  const predefined = memberKind ? getPredefinedMilestones(memberKind) : [];
  const {
    data: custom,
    isLoading: isLoadingCustom,
    isError: isCustomError,
  } = useCustomMilestones(familyId, memberId);

  const nameMap = useMemo(() => {
    const map = new Map<string, { name: string; category: string }>();
    for (const m of predefined) {
      map.set(m.key, { name: m.name, category: m.category });
    }
    if (custom) {
      for (const m of custom) {
        map.set(m.key, { name: m.name, category: m.category });
      }
    }
    return map;
  }, [predefined, custom]);

  const isLoading = isLoadingKeys || isLoadingCustom;
  const isError = isKeysError || isCustomError || isDependentsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-destructive py-8 text-center">
        Failed to load timeline.
      </div>
    );
  }

  if (!achievedKeys || achievedKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
        <Clock className="h-8 w-8" />
        <p className="text-sm">No milestones achieved yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {achievedKeys.map((key) => {
        const info = nameMap.get(key);
        return (
          <TimelineEntry
            key={key}
            familyId={familyId}
            memberId={memberId}
            milestoneKey={key}
            milestoneName={info?.name ?? key}
            category={info?.category ?? null}
            onClick={() => goToMilestoneDetail(memberId, key)}
          />
        );
      })}
    </div>
  );
}

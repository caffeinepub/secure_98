import { useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useCustomMilestones,
  useAchievedMilestoneKeys,
  useFamilyDependents,
  useDeleteCustomMilestone,
} from "../hooks/useQueries";
import { getPredefinedMilestones } from "../utils/milestones";
import { useAppStore } from "../stores/useAppStore";
import { MilestoneRow } from "./MilestoneRow";
import { AddCustomMilestoneDialog } from "./AddCustomMilestoneDialog";
import { AppHeader } from "./AppHeader";

interface MilestonesListProps {
  familyId: bigint;
  memberId: bigint;
  canAddMeasurementsAndMilestones: boolean;
}

interface MilestoneItem {
  key: string;
  name: string;
  category: string;
  ageRange: string | null;
  isCustom: boolean;
}

export function MilestonesList({
  familyId,
  memberId,
  canAddMeasurementsAndMilestones,
}: MilestonesListProps) {
  const goToMember = useAppStore((s) => s.goToMember);
  const goToMilestoneDetail = useAppStore((s) => s.goToMilestoneDetail);

  const { data: dependents, isError: isDependentsError } =
    useFamilyDependents(familyId);

  const member = useMemo(() => {
    const dep = dependents?.find((d) => d.id === memberId);
    if (!dep) return null;
    return { kind: dep.kind, name: dep.name };
  }, [dependents, memberId]);

  const memberKind = member?.kind ?? null;

  const predefined = memberKind ? getPredefinedMilestones(memberKind) : [];
  const {
    data: custom,
    isLoading: isLoadingCustom,
    isError: isCustomError,
  } = useCustomMilestones(familyId, memberId);
  const {
    data: achievedKeysData,
    isLoading: isLoadingAchieved,
    isError: isAchievedError,
  } = useAchievedMilestoneKeys(familyId, memberId);

  const { mutate: deleteCustom, isPending: isDeletingCustom } =
    useDeleteCustomMilestone();

  const [addCustomOpen, setAddCustomOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MilestoneItem | null>(null);

  const achievedKeys = useMemo(() => {
    return new Set(achievedKeysData ?? []);
  }, [achievedKeysData]);

  const allMilestones = useMemo((): MilestoneItem[] => {
    const items: MilestoneItem[] = [];
    for (const m of predefined) {
      items.push({
        key: m.key,
        name: m.name,
        category: m.category,
        ageRange: m.ageRange,
        isCustom: false,
      });
    }
    if (custom) {
      for (const m of custom) {
        items.push({
          key: m.key,
          name: m.name,
          category: m.category,
          ageRange: null,
          isCustom: true,
        });
      }
    }
    return items;
  }, [predefined, custom]);

  const grouped = useMemo(() => {
    const groups = new Map<string, MilestoneItem[]>();
    for (const m of allMilestones) {
      const items = groups.get(m.category) ?? [];
      items.push(m);
      groups.set(m.category, items);
    }
    return groups;
  }, [allMilestones]);

  const achievedCount = achievedKeys.size;
  const totalCount = allMilestones.length;

  const handleDeleteCustom = () => {
    if (!deleteTarget) return;
    deleteCustom(
      { familyId, memberId, milestoneKey: deleteTarget.key },
      {
        onSuccess: () => {
          toast.success("Custom milestone deleted");
          setDeleteTarget(null);
        },
        onError: () => toast.error("Failed to delete milestone"),
      },
    );
  };

  const isLoading = isLoadingCustom || isLoadingAchieved;
  const isError = isCustomError || isAchievedError || isDependentsError;

  if (isLoading) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <AppHeader
        title={member?.name ? `${member.name}'s Milestones` : "Milestones"}
        onBack={() => goToMember(memberId)}
      >
        <span className="text-sm text-muted-foreground">
          {achievedCount}/{totalCount}
        </span>
      </AppHeader>

      <div className="px-4 sm:px-6 py-4 max-w-2xl mx-auto space-y-6">
        {isError && (
          <div className="text-sm text-destructive">
            Failed to load milestones.
          </div>
        )}

        {grouped.size === 0 && !isError && (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No milestones available.
          </div>
        )}

        {Array.from(grouped.entries()).map(([category, items]) => {
          const categoryAchieved = items.filter((m) =>
            achievedKeys.has(m.key),
          ).length;
          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  {category}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {categoryAchieved}/{items.length}
                </span>
              </div>

              <div className="space-y-1">
                {items.map((milestone) => (
                  <MilestoneRow
                    key={milestone.key}
                    familyId={familyId}
                    memberId={memberId}
                    milestoneKey={milestone.key}
                    milestoneName={milestone.name}
                    ageRange={milestone.ageRange}
                    isCustom={milestone.isCustom}
                    isAchieved={achievedKeys.has(milestone.key)}
                    canAddMeasurementsAndMilestones={
                      canAddMeasurementsAndMilestones
                    }
                    onClick={() => goToMilestoneDetail(memberId, milestone.key)}
                    onDelete={
                      milestone.isCustom
                        ? () => setDeleteTarget(milestone)
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}

        {canAddMeasurementsAndMilestones && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setAddCustomOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add custom milestone
          </Button>
        )}
      </div>

      <AddCustomMilestoneDialog
        open={addCustomOpen}
        onOpenChange={setAddCustomOpen}
        familyId={familyId}
        memberId={memberId}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete custom milestone?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.name}" and any linked
              memories will be unlinked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCustom}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteCustom();
              }}
              disabled={isDeletingCustom}
            >
              {isDeletingCustom && <Loader2 className="h-4 w-4 animate-spin" />}
              {isDeletingCustom ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

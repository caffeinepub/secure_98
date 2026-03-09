import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useMemoriesForMilestone,
  useFamilyDependents,
  useCustomMilestones,
} from "../hooks/useQueries";
import { getPredefinedMilestones } from "../utils/milestones";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAppStore } from "../stores/useAppStore";
import { MemoryCard } from "./MemoryCard";
import { CreateMemoryDialog } from "./CreateMemoryDialog";
import { AppHeader } from "./AppHeader";

interface MilestoneDetailProps {
  familyId: bigint;
  memberId: bigint;
  milestoneKey: string;
  canAddMeasurementsAndMilestones: boolean;
  isOwner?: boolean;
}

export function MilestoneDetail({
  familyId,
  memberId,
  milestoneKey,
  canAddMeasurementsAndMilestones,
  isOwner,
}: MilestoneDetailProps) {
  const goToMilestonesList = useAppStore((s) => s.goToMilestonesList);
  const { identity } = useInternetIdentity();
  const currentPrincipal = identity?.getPrincipal().toString();

  const { data: dependents, isError: isDependentsError } =
    useFamilyDependents(familyId);

  const member = useMemo(() => {
    const dep = dependents?.find((d) => d.id === memberId);
    if (!dep) return null;
    return { kind: dep.kind, name: dep.name };
  }, [dependents, memberId]);

  const memberKind = member?.kind ?? null;

  const predefined = memberKind ? getPredefinedMilestones(memberKind) : [];
  const { data: custom, isError: isCustomQueryError } = useCustomMilestones(
    familyId,
    memberId,
  );

  const milestoneInfo = useMemo(() => {
    const found = predefined.find((m) => m.key === milestoneKey);
    if (found) return { name: found.name, category: found.category };
    if (custom) {
      const customFound = custom.find((m) => m.key === milestoneKey);
      if (customFound)
        return { name: customFound.name, category: customFound.category };
    }
    return null;
  }, [predefined, custom, milestoneKey]);

  const {
    data: linkedMemories,
    isLoading,
    isError,
  } = useMemoriesForMilestone(familyId, memberId, milestoneKey);

  const [showCreateMemory, setShowCreateMemory] = useState(false);

  const allMembers = useMemo(() => {
    if (!dependents) return [];
    return dependents.map((d) => ({ id: d.id, name: d.name }));
  }, [dependents]);

  const resolveTaggedMembers = (ids: bigint[]) => {
    return ids
      .map((id) => allMembers.find((m) => m.id === id))
      .filter((m): m is { id: bigint; name: string } => m !== undefined);
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const memoryCount = linkedMemories?.length ?? 0;

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <AppHeader
        title={milestoneInfo?.name ?? milestoneKey}
        onBack={() => goToMilestonesList(memberId)}
      />

      <div className="px-4 sm:px-6 py-4 max-w-2xl mx-auto space-y-4">
        {/* Milestone info */}
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">
            {member?.name ? `${member.name}'s milestone` : "Milestone"}
          </p>
          <p className="text-xs text-muted-foreground">
            {memoryCount === 0
              ? "No moments linked yet"
              : `${memoryCount} linked ${memoryCount === 1 ? "moment" : "moments"}`}
          </p>
        </div>

        {/* Action buttons */}
        {canAddMeasurementsAndMilestones && (
          <Button className="w-full" onClick={() => setShowCreateMemory(true)}>
            <Plus className="h-4 w-4" />
            Add moment
          </Button>
        )}

        {(isError || isDependentsError || isCustomQueryError) && (
          <p className="text-sm text-destructive">
            Failed to load milestone data.
          </p>
        )}

        {/* Empty state */}
        {!isError &&
          !isDependentsError &&
          !isCustomQueryError &&
          memoryCount === 0 && (
            <div className="text-center py-12 space-y-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">No moments yet</p>
                <p className="text-xs text-muted-foreground">
                  {canAddMeasurementsAndMilestones
                    ? "Add a moment to mark this milestone as achieved."
                    : "No moments have been linked to this milestone yet."}
                </p>
              </div>
            </div>
          )}

        {/* Linked memories feed */}
        {linkedMemories && linkedMemories.length > 0 && (
          <div className="space-y-3">
            {linkedMemories.map((memory) => {
              const isAuthor = memory.author.toString() === currentPrincipal;
              return (
                <div key={memory.id.toString()}>
                  <MemoryCard
                    familyId={familyId}
                    memoryId={memory.id}
                    caption={memory.caption ?? null}
                    media={memory.mediaBlobs.map((blob, i) => ({
                      url: blob.getDirectURL(),
                      type: (memory.mediaTypes[i] === "video"
                        ? "video"
                        : "image") as "image" | "video",
                    }))}
                    taggedMembers={resolveTaggedMembers(memory.taggedMemberIds)}
                    authorName={memory.authorName}
                    authorPhotoUrl={
                      memory.authorPhotoBlob?.getDirectURL() ?? null
                    }
                    createdAt={memory.createdAt}
                    isAuthor={isAuthor}
                    isOwner={isOwner}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Memory Dialog pre-filled with milestone */}
      <CreateMemoryDialog
        open={showCreateMemory}
        onOpenChange={setShowCreateMemory}
        defaultDate={format(new Date(), "yyyy-MM-dd")}
        milestoneKey={milestoneKey}
        milestoneMemberId={memberId}
      />
    </div>
  );
}

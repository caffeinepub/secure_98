import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "../stores/useAppStore";
import {
  useDeleteMemory,
  useMemoriesByDate,
  useFamilyDependents,
} from "../hooks/useQueries";
import { MemoryCard } from "./MemoryCard";
import { CreateMemoryDialog, type EditableMemory } from "./CreateMemoryDialog";
import { AppHeader } from "./AppHeader";
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

interface DayDetailProps {
  canAddMemories: boolean;
  isOwner: boolean;
  onNewMemory: () => void;
}

export function DayDetail({
  canAddMemories,
  isOwner,
  onNewMemory,
}: DayDetailProps) {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const activeFamilyId = useAppStore((s) => s.activeFamilyId);
  const goHome = useAppStore((s) => s.goHome);

  const {
    data: memories,
    isLoading,
    isError,
  } = useMemoriesByDate(activeFamilyId, selectedDate);
  const { data: dependents, isError: isDependentsError } =
    useFamilyDependents(activeFamilyId);
  const { mutate: deleteMemory, isPending: isDeleting } = useDeleteMemory();

  const [editingMemory, setEditingMemory] = useState<EditableMemory | null>(
    null,
  );
  const [deletingMemoryId, setDeletingMemoryId] = useState<bigint | null>(null);

  const memberMap = new Map<string, string>();
  dependents?.forEach((d) => memberMap.set(d.id.toString(), d.name));

  const filteredMemories = memories;

  const resolveTaggedMembers = (ids: bigint[]) =>
    ids
      .map((id) => ({
        id,
        name: memberMap.get(id.toString()) ?? "Unknown",
      }))
      .filter((m) => m.name !== "Unknown");

  const handleDelete = () => {
    if (deletingMemoryId === null || activeFamilyId === null) return;
    deleteMemory(
      { familyId: activeFamilyId, memoryId: deletingMemoryId },
      {
        onSuccess: () => {
          toast.success("Memory deleted");
          setDeletingMemoryId(null);
        },
        onError: () => {
          toast.error("Failed to delete memory");
        },
      },
    );
  };

  const formattedDate = selectedDate
    ? format(parseISO(selectedDate), "MMM d, yyyy")
    : "";

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <AppHeader title={formattedDate} onBack={goHome}>
        {canAddMemories && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onNewMemory}
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}
      </AppHeader>

      <div className="mx-auto max-w-2xl">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {(isError || isDependentsError) && (
          <p className="p-4 text-sm text-destructive">
            Failed to load memories.
          </p>
        )}

        {!isLoading &&
          !isError &&
          !isDependentsError &&
          filteredMemories &&
          filteredMemories.length === 0 && (
            <div className="text-center py-16 space-y-1">
              <p className="text-muted-foreground">
                No memories for this day yet.
              </p>
            </div>
          )}

        {filteredMemories && filteredMemories.length > 0 && (
          <div className="divide-y divide-border/40">
            {filteredMemories.map((memory) => (
              <MemoryCard
                key={memory.id.toString()}
                familyId={activeFamilyId}
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
                authorPhotoUrl={memory.authorPhotoBlob?.getDirectURL() ?? null}
                createdAt={memory.createdAt}
                isAuthor={memory.isAuthor}
                isOwner={isOwner}
                onEdit={() =>
                  setEditingMemory({
                    id: memory.id,
                    date: memory.date,
                    caption: memory.caption ?? null,
                    mediaBlobs: memory.mediaBlobs,
                    mediaTypes: memory.mediaTypes,
                    taggedMemberIds: memory.taggedMemberIds,
                  })
                }
                onDelete={() => setDeletingMemoryId(memory.id)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateMemoryDialog
        open={!!editingMemory}
        onOpenChange={(open) => {
          if (!open) setEditingMemory(null);
        }}
        memory={editingMemory ?? undefined}
      />

      <AlertDialog
        open={deletingMemoryId !== null}
        onOpenChange={() => setDeletingMemoryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete memory?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The memory and its media will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

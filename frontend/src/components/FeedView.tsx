import { useState, useMemo } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  useRecentMemories,
  useFamilyDependents,
  useDeleteMemory,
} from "../hooks/useQueries";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { MemoryCard } from "./MemoryCard";
import { CreateMemoryDialog, type EditableMemory } from "./CreateMemoryDialog";
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

interface FeedViewProps {
  familyId: bigint;
  memberId: bigint | null;
  canAddMemories: boolean;
  isOwner: boolean;
  onNewMemory: () => void;
}

export function FeedView({
  familyId,
  memberId,
  canAddMemories,
  isOwner,
  onNewMemory,
}: FeedViewProps) {
  const {
    data: feedData,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useRecentMemories(familyId, memberId);

  const { data: dependents, isError: isDependentsError } =
    useFamilyDependents(familyId);
  const { mutate: deleteMemory, isPending: isDeleting } = useDeleteMemory();

  const [editingMemory, setEditingMemory] = useState<EditableMemory | null>(
    null,
  );
  const [deletingMemoryId, setDeletingMemoryId] = useState<bigint | null>(null);

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const allMemories = useMemo(
    () => feedData?.pages.flatMap((page) => page.memories) ?? [],
    [feedData],
  );

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

  const handleDelete = () => {
    if (deletingMemoryId === null) return;
    deleteMemory(
      { familyId, memoryId: deletingMemoryId },
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || isDependentsError) {
    return (
      <p className="p-4 text-center text-destructive">Failed to load feed.</p>
    );
  }

  if (allMemories.length === 0) {
    return (
      <div className="flex flex-col items-center px-8 py-16 text-center">
        <p className="text-base font-medium">No memories yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Start capturing moments to see them here.
        </p>
        {canAddMemories && (
          <Button className="mt-4" variant="outline" onClick={onNewMemory}>
            <Plus className="h-4 w-4" />
            Add First Memory
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-2xl divide-y divide-border/40">
        {allMemories.map((memory) => (
          <MemoryCard
            key={memory.id.toString()}
            familyId={familyId}
            memoryId={memory.id}
            caption={memory.caption ?? null}
            media={memory.mediaBlobs.map((blob, i) => ({
              url: blob.getDirectURL(),
              type: (memory.mediaTypes[i] === "video" ? "video" : "image") as
                | "image"
                | "video",
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
        <div ref={sentinelRef} className="h-1" />
        {isFetchingNextPage && (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
    </>
  );
}

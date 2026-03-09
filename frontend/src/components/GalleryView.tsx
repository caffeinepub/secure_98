import { useMemo, useState } from "react";
import { ImageIcon, Loader2, Play } from "lucide-react";
import { useMediaMemories, useFamilyDependents } from "../hooks/useQueries";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { GalleryLightbox } from "./GalleryLightbox";
import { cn } from "@/lib/utils";

interface GalleryViewProps {
  familyId: bigint;
  memberId: bigint | null;
}

export function GalleryView({ familyId, memberId }: GalleryViewProps) {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useMediaMemories(familyId, memberId);

  const { data: dependents, isError: isDependentsError } =
    useFamilyDependents(familyId);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const allMemories = useMemo(
    () => data?.pages.flatMap((page) => page.memories) ?? [],
    [data],
  );

  const memberMap = useMemo(() => {
    const map = new Map<string, string>();
    dependents?.forEach((d) => map.set(d.id.toString(), d.name));
    return map;
  }, [dependents]);

  const lightboxMemories = useMemo(
    () =>
      allMemories.map((memory) => ({
        id: memory.id,
        date: memory.date,
        caption: memory.caption ?? null,
        mediaUrls: memory.mediaBlobs.map((blob, i) => ({
          url: blob.getDirectURL(),
          type: (memory.mediaTypes[i] === "video" ? "video" : "image") as
            | "image"
            | "video",
        })),
        taggedMembers: memory.taggedMemberIds
          .map((id) => ({
            id,
            name: memberMap.get(id.toString()) ?? "Unknown",
          }))
          .filter((m) => m.name !== "Unknown"),
      })),
    [allMemories, memberMap],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || isDependentsError) {
    return (
      <p className="p-4 text-center text-destructive">
        Failed to load gallery.
      </p>
    );
  }

  if (allMemories.length === 0) {
    return (
      <div className="flex flex-col items-center px-8 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ImageIcon className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg font-semibold">No photos yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Memories with photos or videos will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="px-1 py-2">
        <div className="grid grid-cols-3 gap-0.5 sm:grid-cols-4 lg:grid-cols-5">
          {allMemories.map((memory, index) => {
            const firstBlob = memory.mediaBlobs[0];
            const firstType = memory.mediaTypes[0];
            const isVideo = firstType === "video";
            const thumbUrl = firstBlob?.getDirectURL();

            return (
              <button
                key={memory.id.toString()}
                onClick={() => setLightboxIndex(index)}
                className={cn(
                  "relative aspect-square overflow-hidden bg-muted",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                )}
              >
                {thumbUrl ? (
                  isVideo ? (
                    <video
                      src={thumbUrl}
                      className="h-full w-full object-cover"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={thumbUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50">
                      <Play className="h-4 w-4 fill-white text-white" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div ref={sentinelRef} className="h-1" />
        {isFetchingNextPage && (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          memories={lightboxMemories}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

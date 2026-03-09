import { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, X, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "../stores/useAppStore";

interface TaggedMember {
  id: bigint;
  name: string;
}

interface LightboxMemory {
  id: bigint;
  date: string;
  caption: string | null;
  mediaUrls: { url: string; type: "image" | "video" }[];
  taggedMembers: TaggedMember[];
}

interface GalleryLightboxProps {
  memories: LightboxMemory[];
  initialIndex: number;
  onClose: () => void;
}

export function GalleryLightbox({
  memories,
  initialIndex,
  onClose,
}: GalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mediaIndex, setMediaIndex] = useState(0);
  const goToDay = useAppStore((s) => s.goToDay);

  const memory = memories[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < memories.length - 1;
  const currentMedia = memory?.mediaUrls[mediaIndex];
  const hasMultipleMedia = (memory?.mediaUrls.length ?? 0) > 1;

  const goToPrev = useCallback(() => {
    if (hasPrev) {
      setCurrentIndex((i) => i - 1);
      setMediaIndex(0);
    }
  }, [hasPrev]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      setCurrentIndex((i) => i + 1);
      setMediaIndex(0);
    }
  }, [hasNext]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goToPrev, goToNext]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!memory) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-white/70">
          {currentIndex + 1} / {memories.length}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/10"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Media area */}
      <div className="relative flex flex-1 items-center justify-center min-h-0">
        {hasPrev && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 z-10 h-10 w-10 rounded-full text-white hover:bg-white/10"
            onClick={goToPrev}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        {currentMedia && (
          <div className="flex h-full w-full items-center justify-center px-12">
            {currentMedia.type === "video" ? (
              <video
                key={`${memory.id}-${mediaIndex}`}
                src={currentMedia.url}
                controls
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <img
                key={`${memory.id}-${mediaIndex}`}
                src={currentMedia.url}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
        )}

        {hasNext && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 z-10 h-10 w-10 rounded-full text-white hover:bg-white/10"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Media dots (when memory has multiple media) */}
      {hasMultipleMedia && (
        <div className="flex justify-center gap-1.5 py-2">
          {memory.mediaUrls.map((_, i) => (
            <button
              key={i}
              onClick={() => setMediaIndex(i)}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                i === mediaIndex ? "bg-white" : "bg-white/40",
              )}
            />
          ))}
        </div>
      )}

      {/* Info area */}
      <div className="space-y-2 px-4 pb-4 pt-2">
        {memory.caption && (
          <p className="text-sm text-white/90">{memory.caption}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {memory.taggedMembers.map((m) => (
            <Badge
              key={m.id.toString()}
              variant="outline"
              className="border-white/30 text-xs text-white/80"
            >
              {m.name}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50">
            {format(parseISO(memory.date), "MMM d, yyyy")}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => goToDay(memory.date)}
          >
            <Calendar className="h-3.5 w-3.5" />
            View in context
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLikes, useToggleLike } from "../hooks/useQueries";

interface ReactionBarProps {
  familyId: bigint;
  memoryId: bigint;
}

export function ReactionBar({ familyId, memoryId }: ReactionBarProps) {
  const { data: likes, isError } = useLikes(familyId, memoryId);
  const { mutate: toggleLike, isPending } = useToggleLike();

  const handleToggle = () => {
    toggleLike(
      { familyId, memoryId },
      { onError: () => toast.error("Failed to update like") },
    );
  };

  if (isError) return null;

  const liked = likes?.likedByMe ?? false;
  const count = likes ? Number(likes.count) : 0;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-7 gap-1 px-1.5", liked && "text-destructive")}
      onClick={handleToggle}
      disabled={isPending}
    >
      <Heart className={cn("h-4 w-4", liked && "fill-destructive")} />
      {count > 0 && <span className="text-xs">{count}</span>}
    </Button>
  );
}

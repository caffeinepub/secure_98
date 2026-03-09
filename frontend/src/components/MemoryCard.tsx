import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fromNanoseconds } from "../utils/formatting";
import { ReactionBar } from "./ReactionBar";
import { CommentSection } from "./CommentSection";

interface TaggedMember {
  id: bigint;
  name: string;
}

interface MemoryMedia {
  url: string;
  type: "image" | "video";
}

interface MemoryCardProps {
  familyId?: bigint | null;
  memoryId?: bigint | null;
  caption: string | null;
  media: MemoryMedia[];
  taggedMembers: TaggedMember[];
  authorName: string;
  authorPhotoUrl?: string | null;
  createdAt: bigint;
  isAuthor?: boolean;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return `${weeks}w`;
}

export function MemoryCard({
  familyId,
  memoryId,
  caption,
  media,
  taggedMembers,
  authorName,
  authorPhotoUrl,
  createdAt,
  isAuthor,
  isOwner,
  onEdit,
  onDelete,
}: MemoryCardProps) {
  const showMenu = isAuthor || isOwner;
  const initials = authorName.charAt(0).toUpperCase();
  const timeAgo = formatRelativeTime(fromNanoseconds(createdAt));

  return (
    <div className="py-3 px-4">
      <div className="flex gap-3">
        <div className="shrink-0">
          <Avatar className="h-9 w-9">
            {authorPhotoUrl ? (
              <AvatarImage
                src={authorPhotoUrl}
                alt={authorName}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <span className="font-semibold text-[15px]">{authorName}</span>
            <span className="text-muted-foreground text-sm ml-1.5">
              {timeAgo}
            </span>
            {showMenu && (
              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {caption && (
            <p className="text-[15px] mt-0.5 leading-normal">{caption}</p>
          )}

          {media.length > 0 && (
            <div
              className={cn(
                "mt-2.5 rounded-xl overflow-hidden",
                media.length > 1 && "grid grid-cols-2 gap-0.5",
              )}
            >
              {media.map((m, i) => (
                <div
                  key={i}
                  className={cn(media.length === 3 && i === 0 && "col-span-2")}
                >
                  {m.type === "video" ? (
                    <video
                      src={m.url}
                      controls
                      className="w-full aspect-video object-cover"
                    />
                  ) : (
                    <img
                      src={m.url}
                      alt=""
                      className="w-full aspect-square object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {taggedMembers.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1.5">
              {taggedMembers.map((m) => m.name).join(", ")}
            </p>
          )}

          {familyId != null && memoryId != null && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <ReactionBar familyId={familyId} memoryId={memoryId} />
              <CommentSection familyId={familyId} memoryId={memoryId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, MessageCircle, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useComments,
  useAddComment,
  useDeleteComment,
} from "../hooks/useQueries";
import { fromNanoseconds } from "../utils/formatting";

interface CommentSectionProps {
  familyId: bigint;
  memoryId: bigint;
}

export function CommentSection({ familyId, memoryId }: CommentSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");

  const {
    data: comments,
    isLoading,
    isError,
  } = useComments(familyId, memoryId);

  const { mutate: addComment, isPending: isAdding } = useAddComment();
  const { mutate: deleteComment, isPending: isDeletePending } =
    useDeleteComment();

  const commentCount = comments?.length ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    addComment(
      { familyId, memoryId, text: trimmed },
      {
        onSuccess: () => {
          setText("");
        },
        onError: (err) => {
          toast.error(err.message || "Failed to add comment");
        },
      },
    );
  };

  const handleDelete = (commentId: bigint) => {
    deleteComment(
      { familyId, commentId, memoryId },
      {
        onError: () => {
          toast.error("Failed to delete comment");
        },
      },
    );
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-1.5"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <MessageCircle className="h-4 w-4" />
        {commentCount > 0 && <span className="text-xs">{commentCount}</span>}
      </Button>

      {expanded && (
        <div className="basis-full mt-1 space-y-2">
          {isLoading && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {isError && (
            <p className="text-xs text-destructive">Failed to load comments.</p>
          )}

          {comments && comments.length > 0 && (
            <div className="space-y-2">
              {comments.map((comment) => (
                <div
                  key={comment.id.toString()}
                  className="flex items-start gap-2 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{comment.authorName}</span>{" "}
                      {comment.text}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(fromNanoseconds(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {comment.canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => handleDelete(comment.id)}
                      disabled={isDeletePending}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              maxLength={300}
              className="h-8 text-sm"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              disabled={!text.trim() || isAdding}
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}

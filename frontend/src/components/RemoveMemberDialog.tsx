import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { useRemoveDependent } from "../hooks/useQueries";

interface RemoveMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyId: bigint;
  memberId: bigint;
  memberName: string;
  type: "child" | "pet";
}

export function RemoveMemberDialog({
  open,
  onOpenChange,
  familyId,
  memberId,
  memberName,
  type,
}: RemoveMemberDialogProps) {
  const { mutate: removeDependent, isPending } = useRemoveDependent();

  const handleRemove = () => {
    removeDependent(
      { familyId, dependentId: memberId },
      {
        onSuccess: () => {
          toast.success(`${memberName} removed`);
          onOpenChange(false);
        },
        onError: (err: Error) => {
          toast.error(err.message || `Failed to remove ${memberName}`);
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {memberName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove {memberName} and all associated data
            including tagged memories, milestones,{" "}
            {type === "child" ? "growth measurements, " : ""}reactions, and
            comments. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleRemove();
            }}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

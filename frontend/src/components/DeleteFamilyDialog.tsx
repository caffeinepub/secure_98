import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { useDeleteFamily } from "../hooks/useQueries";
import { useAppStore } from "../stores/useAppStore";

interface DeleteFamilyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyId: bigint;
  familyName: string;
}

export function DeleteFamilyDialog({
  open,
  onOpenChange,
  familyId,
  familyName,
}: DeleteFamilyDialogProps) {
  const { mutate: deleteFamily, isPending } = useDeleteFamily();
  const reset = useAppStore((s) => s.reset);
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    if (!open) return;
    setConfirmation("");
  }, [open]);

  const handleDelete = () => {
    deleteFamily(
      { familyId },
      {
        onSuccess: () => {
          toast.success("Family deleted");
          reset();
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to delete family");
        },
      },
    );
  };

  const isConfirmed = confirmation === familyName;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete family?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              This will permanently delete the family and all associated data
              including children, pets, memories, photos, milestones, growth
              measurements, reactions, comments, and invite codes.
            </span>
            <span className="block font-medium text-destructive">
              This action cannot be undone.
            </span>
            <span className="block pt-1">
              Type <span className="font-semibold">{familyName}</span> to
              confirm:
            </span>
          </AlertDialogDescription>
          <Input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={familyName}
            className="mt-2"
            disabled={isPending}
          />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending || !isConfirmed}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Deleting..." : "Delete Family"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

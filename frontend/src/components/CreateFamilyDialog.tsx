import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateFamily } from "../hooks/useQueries";
import { useAppStore } from "../stores/useAppStore";
import { MAX_FAMILY_NAME } from "../utils/constants";

interface CreateFamilyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFamilyDialog({
  open,
  onOpenChange,
}: CreateFamilyDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const setActiveFamilyId = useAppStore((s) => s.setActiveFamilyId);

  const { mutate: createFamily, isPending } = useCreateFamily();

  useEffect(() => {
    if (!open) return;
    setName("");
    setError("");
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter a family name");
      return;
    }

    createFamily(
      { name: trimmedName },
      {
        onSuccess: (familyId) => {
          setActiveFamilyId(familyId);
          toast.success("Family created!");
          onOpenChange(false);
        },
        onError: (err) => {
          setError(err.message || "Failed to create family");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Family</DialogTitle>
          <DialogDescription>
            Create a new family to track milestones and memories.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="family-name">Family Name</Label>
            <Input
              id="family-name"
              placeholder="Enter family name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={MAX_FAMILY_NAME}
              autoFocus
              disabled={isPending}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Creating..." : "Create Family"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

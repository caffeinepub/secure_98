import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateCustomMilestone } from "../hooks/useQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CUSTOM_CATEGORIES = [
  "Custom",
  "Cognition",
  "Communication",
  "Fine Motor",
  "Gross Motor",
  "Social",
  "Training",
  "Firsts",
  "Health",
];

interface AddCustomMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyId: bigint;
  memberId: bigint;
}

export function AddCustomMilestoneDialog({
  open,
  onOpenChange,
  familyId,
  memberId,
}: AddCustomMilestoneDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Custom");
  const [error, setError] = useState("");

  const { mutate: createCustom, isPending } = useCreateCustomMilestone();

  useEffect(() => {
    if (!open) return;
    setName("");
    setCategory("Custom");
    setError("");
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required");
      return;
    }
    if (trimmedName.length > 200) {
      setError("Name must be 200 characters or fewer");
      return;
    }

    createCustom(
      {
        familyId,
        memberId,
        name: trimmedName,
        category: category === "Custom" ? null : category,
      },
      {
        onSuccess: () => {
          toast.success("Custom milestone created");
          onOpenChange(false);
        },
        onError: (err) => {
          setError(err.message || "Failed to create milestone");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Milestone</DialogTitle>
          <DialogDescription>
            Create a milestone specific to your child or pet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-milestone-name">Name</Label>
            <Input
              id="custom-milestone-name"
              placeholder="e.g. First time at the beach"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-milestone-category">
              Category (optional)
            </Label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isPending}
            >
              <SelectTrigger id="custom-milestone-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CUSTOM_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

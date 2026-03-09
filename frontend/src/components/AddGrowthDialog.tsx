import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MemberKind } from "../backend";
import { useAddGrowthMeasurement } from "../hooks/useQueries";

export type GrowthMetric = "height" | "weight";

interface AddGrowthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyId: bigint;
  dependentId: bigint;
  memberKind: MemberKind;
  metric?: GrowthMetric;
}

export function AddGrowthDialog({
  open,
  onOpenChange,
  familyId,
  dependentId,
  memberKind,
  metric = "height",
}: AddGrowthDialogProps) {
  const isChild = memberKind === MemberKind.child;
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const { mutate: addMeasurement, isPending } = useAddGrowthMeasurement();

  useEffect(() => {
    if (!open) return;
    setDate(format(new Date(), "yyyy-MM-dd"));
    setValue("");
    setError("");
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsed = value.trim() ? parseFloat(value) : null;

    if (parsed === null) {
      setError(
        isChild && metric === "height"
          ? "Height is required."
          : "Weight is required.",
      );
      return;
    }

    if (isNaN(parsed) || parsed <= 0) {
      setError(
        isChild && metric === "height"
          ? "Height must be a positive number."
          : "Weight must be a positive number.",
      );
      return;
    }

    if (!date) {
      setError("Date is required.");
      return;
    }

    addMeasurement(
      {
        familyId,
        dependentId,
        date,
        heightCm: isChild && metric === "height" ? parsed : null,
        weightKg: metric === "weight" || !isChild ? parsed : null,
      },
      {
        onSuccess: () => {
          toast.success("Measurement added");
          onOpenChange(false);
        },
        onError: (err) => {
          setError(err.message || "Failed to add measurement");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isChild
              ? metric === "height"
                ? "Add Height"
                : "Add Weight"
              : "Add Weight"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="growth-date">Date</Label>
            <Input
              id="growth-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="growth-value">
              {isChild && metric === "height"
                ? "Height (cm)"
                : `Weight (${isChild ? "kg" : "lbs"})`}
            </Label>
            <Input
              id="growth-value"
              type="number"
              step={isChild && metric === "height" ? "0.1" : "0.01"}
              min="0"
              placeholder={
                isChild && metric === "height"
                  ? "e.g. 52.5"
                  : isChild
                    ? "e.g. 3.5"
                    : "e.g. 25.5"
              }
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={isPending}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isPending ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

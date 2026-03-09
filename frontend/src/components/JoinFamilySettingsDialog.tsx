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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRedeemInviteCode } from "../hooks/useQueries";
import { useAppStore } from "../stores/useAppStore";
import { Relationship } from "../backend";
import { RELATIONSHIPS } from "../utils/constants";

interface JoinFamilySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinFamilySettingsDialog({
  open,
  onOpenChange,
}: JoinFamilySettingsDialogProps) {
  const [code, setCode] = useState("");
  const [relationship, setRelationship] = useState("");
  const [error, setError] = useState("");
  const setActiveFamilyId = useAppStore((s) => s.setActiveFamilyId);

  const { mutate: redeemCode, isPending } = useRedeemInviteCode();

  useEffect(() => {
    if (!open) return;
    setCode("");
    setRelationship("");
    setError("");
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError("Please enter an invite code");
      return;
    }
    if (!relationship) {
      setError("Please select your relationship");
      return;
    }

    redeemCode(
      {
        code: trimmedCode,
        relationship: relationship as Relationship,
      },
      {
        onSuccess: (family) => {
          setActiveFamilyId(family.id);
          toast.success(`Joined ${family.name}!`);
          onOpenChange(false);
        },
        onError: (err) => {
          setError(err.message || "Failed to join family");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a Family</DialogTitle>
          <DialogDescription>
            Enter the invite code shared by a family member.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-invite-code">Invite Code</Label>
            <Input
              id="settings-invite-code"
              placeholder="Enter 8-character code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={8}
              autoFocus
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-relationship">Your Relationship</Label>
            <Select
              value={relationship}
              onValueChange={setRelationship}
              disabled={isPending}
            >
              <SelectTrigger id="settings-relationship">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Joining..." : "Join Family"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

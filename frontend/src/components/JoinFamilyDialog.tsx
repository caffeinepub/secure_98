import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

export function JoinFamilyDialog({
  onComplete,
  onBack,
}: {
  onComplete: () => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [relationship, setRelationship] = useState("");
  const [error, setError] = useState("");
  const setActiveFamilyId = useAppStore((s) => s.setActiveFamilyId);

  const { mutate: redeemCode, isPending } = useRedeemInviteCode();

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
          onComplete();
        },
        onError: (err) => {
          setError(err.message || "Failed to join family");
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Join a Family</h1>
          <p className="text-muted-foreground text-sm">
            Enter the invite code shared by a family member.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Invite Code</Label>
            <Input
              id="invite-code"
              placeholder="Enter 8-character code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={8}
              autoFocus
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationship">Your Relationship</Label>
            <Select
              value={relationship}
              onValueChange={setRelationship}
              disabled={isPending}
            >
              <SelectTrigger id="relationship">
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
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Joining..." : "Join Family"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onBack}
            disabled={isPending}
          >
            Back
          </Button>
        </form>
      </div>
    </div>
  );
}

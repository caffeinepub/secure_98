import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateFamily } from "../hooks/useQueries";
import { MAX_FAMILY_NAME } from "../utils/constants";
import { AddMembersStep } from "./AddMembersStep";
import { JoinFamilyDialog } from "./JoinFamilyDialog";

export function FamilySetupFlow({
  onComplete,
  onLogout,
}: {
  onComplete: () => void;
  onLogout: () => void;
}) {
  const [step, setStep] = useState<"create" | "members" | "join">("create");
  const [familyName, setFamilyName] = useState("");
  const [familyId, setFamilyId] = useState<bigint | null>(null);
  const [error, setError] = useState("");

  const { mutate: createFamily, isPending: isCreating } = useCreateFamily();

  const handleCreateFamily = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = familyName.trim();
    if (!trimmed) {
      setError("Please enter a family name");
      return;
    }
    createFamily(
      { name: trimmed },
      {
        onSuccess: (id) => {
          setFamilyId(id);
          setStep("members");
        },
        onError: (err) => {
          setError(err.message || "Failed to create family");
        },
      },
    );
  };

  if (step === "members" && familyId !== null) {
    return <AddMembersStep familyId={familyId} onComplete={onComplete} />;
  }

  if (step === "join") {
    return (
      <JoinFamilyDialog
        onComplete={onComplete}
        onBack={() => setStep("create")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Create Your Family</h1>
          <p className="text-muted-foreground text-sm">
            Give your family journal a name to get started.
          </p>
        </div>
        <form onSubmit={handleCreateFamily} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="family-name">Family Name</Label>
            <Input
              id="family-name"
              placeholder="The Smiths"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              maxLength={MAX_FAMILY_NAME}
              autoFocus
              disabled={isCreating}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
            {isCreating ? "Creating..." : "Continue"}
          </Button>
        </form>
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Have an invite code?{" "}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              onClick={() => setStep("join")}
            >
              Join a family
            </Button>
          </p>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="text-muted-foreground"
            onClick={onLogout}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

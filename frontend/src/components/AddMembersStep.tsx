import { useState } from "react";
import { Baby, PawPrint, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFamilyDependents } from "../hooks/useQueries";
import { MemberKind } from "../backend";
import { AddMemberDialog, type MemberType } from "./AddMemberDialog";

export function AddMembersStep({
  familyId,
  onComplete,
}: {
  familyId: bigint;
  onComplete: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [memberType, setMemberType] = useState<MemberType>("child");

  const {
    data: dependents,
    isLoading,
    isError,
  } = useFamilyDependents(familyId);

  const memberCount = dependents?.length ?? 0;

  const openDialog = (type: MemberType) => {
    setMemberType(type);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Add Your Family</h1>
          <p className="text-muted-foreground text-sm">
            Add children or pets to your journal, or skip for now.
          </p>
        </div>

        {isError && (
          <p className="text-sm text-destructive text-center">
            Failed to load members.
          </p>
        )}

        {!isLoading && memberCount > 0 && (
          <div className="space-y-2">
            {dependents?.map((dep) => (
              <div
                key={`dep-${dep.id}`}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 shadow-sm"
              >
                {dep.kind === MemberKind.child ? (
                  <Baby className="h-5 w-5 text-muted-foreground shrink-0" />
                ) : (
                  <PawPrint className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <span className="font-medium">{dep.name}</span>
                <Badge variant="secondary" className="ml-auto">
                  {dep.kind === MemberKind.child
                    ? "Child"
                    : (dep.petType ?? "Pet")}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => openDialog("child")}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Child
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => openDialog("pet")}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Pet
          </Button>
        </div>

        <Button
          className="w-full"
          variant={memberCount > 0 ? "default" : "ghost"}
          onClick={onComplete}
        >
          {memberCount > 0 ? (
            <>
              <Check className="h-4 w-4" />
              Done
            </>
          ) : (
            "Skip for now"
          )}
        </Button>

        <AddMemberDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          familyId={familyId}
          type={memberType}
        />
      </div>
    </div>
  );
}

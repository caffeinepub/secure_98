import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberKind } from "../backend";
import { useFamilyDependents } from "../hooks/useQueries";
import { MemberCard } from "./MemberCard";
import {
  AddMemberDialog,
  type EditData,
  type MemberType,
} from "./AddMemberDialog";
import { RemoveMemberDialog } from "./RemoveMemberDialog";

interface FamilyMembersProps {
  familyId: bigint;
}

export function FamilyMembers({ familyId }: FamilyMembersProps) {
  const {
    data: dependents,
    isLoading,
    isError,
  } = useFamilyDependents(familyId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<MemberType>("child");
  const [editData, setEditData] = useState<EditData | undefined>(undefined);

  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    id: bigint;
    name: string;
    type: "child" | "pet";
  } | null>(null);

  const openAddDialog = (type: MemberType) => {
    setDialogType(type);
    setEditData(undefined);
    setDialogOpen(true);
  };

  const openEditDialog = (type: MemberType, data: EditData) => {
    setDialogType(type);
    setEditData(data);
    setDialogOpen(true);
  };

  const openRemoveDialog = (
    id: bigint,
    name: string,
    type: "child" | "pet",
  ) => {
    setRemoveTarget({ id, name, type });
    setRemoveOpen(true);
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold tracking-tight">Family Members</h2>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openAddDialog("child")}
          >
            <Plus className="h-3.5 w-3.5" />
            Child
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openAddDialog("pet")}
          >
            <Plus className="h-3.5 w-3.5" />
            Pet
          </Button>
        </div>
      </div>

      {isError && (
        <p className="text-sm text-destructive">Failed to load members.</p>
      )}

      <div className="space-y-2">
        {dependents?.map((dep) => (
          <MemberCard
            key={`dep-${dep.id}`}
            name={dep.name}
            type={dep.kind === MemberKind.child ? "child" : "pet"}
            dateOfBirth={dep.dateOfBirth ?? null}
            petType={dep.petType ?? undefined}
            breed={dep.breed ?? undefined}
            photoUrl={dep.photoBlob?.getDirectURL() ?? null}
            onEdit={() =>
              openEditDialog(dep.kind === MemberKind.child ? "child" : "pet", {
                id: dep.id,
                kind: dep.kind,
                name: dep.name,
                dateOfBirth: dep.dateOfBirth ?? null,
                petType: dep.petType ?? null,
                breed: dep.breed ?? null,
                sex: dep.sex ?? null,
                adoptionDate: dep.adoptionDate ?? null,
                photoBlob: dep.photoBlob ?? null,
              })
            }
            onRemove={() =>
              openRemoveDialog(
                dep.id,
                dep.name,
                dep.kind === MemberKind.child ? "child" : "pet",
              )
            }
          />
        ))}
        {!dependents?.length && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No members yet. Add a child or pet to get started.
          </p>
        )}
      </div>

      <AddMemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        familyId={familyId}
        type={dialogType}
        editData={editData}
      />

      {removeTarget && (
        <RemoveMemberDialog
          open={removeOpen}
          onOpenChange={setRemoveOpen}
          familyId={familyId}
          memberId={removeTarget.id}
          memberName={removeTarget.name}
          type={removeTarget.type}
        />
      )}
    </div>
  );
}

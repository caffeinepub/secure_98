import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  useUpdateMemberPermissions,
  useUpdateMemberRelationship,
  useRemoveFamilyMember,
} from "../hooks/useQueries";
import { type FamilyMemberView, Relationship } from "../backend";
import { RELATIONSHIPS } from "../utils/constants";

export function MemberPermissionsSheet({
  familyId,
  member,
  onOpenChange,
}: {
  familyId: bigint;
  member: FamilyMemberView | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const { mutate: updatePermissions, isPending: isUpdatingPermissions } =
    useUpdateMemberPermissions();
  const { mutate: updateRelationship, isPending: isUpdatingRelationship } =
    useUpdateMemberRelationship();
  const { mutate: removeMember, isPending: isRemoving } =
    useRemoveFamilyMember();

  if (!member) return null;

  const memberPrincipal = member.principal.toString();
  const currentRelationship = member.relationship;
  const {
    canAddMemories,
    canAddMeasurementsAndMilestones,
    canViewMeasurementsAndMilestones,
  } = member.permissions;
  const hasFullAccess =
    canAddMemories &&
    canAddMeasurementsAndMilestones &&
    canViewMeasurementsAndMilestones;

  const handleRelationshipChange = (value: string) => {
    updateRelationship(
      {
        familyId,
        member: memberPrincipal,
        relationship: value as Relationship,
      },
      {
        onSuccess: () => toast.success("Relationship updated"),
        onError: (err) =>
          toast.error(err.message || "Failed to update relationship"),
      },
    );
  };

  const handlePermissionToggle = (
    field:
      | "canAddMemories"
      | "canAddMeasurementsAndMilestones"
      | "canViewMeasurementsAndMilestones",
    value: boolean,
  ) => {
    const updated = {
      canAddMemories: member.permissions.canAddMemories,
      canAddMeasurementsAndMilestones:
        member.permissions.canAddMeasurementsAndMilestones,
      canViewMeasurementsAndMilestones:
        member.permissions.canViewMeasurementsAndMilestones,
      [field]: value,
    };
    updatePermissions(
      { familyId, member: memberPrincipal, permissions: updated },
      {
        onSuccess: () => toast.success("Permissions updated"),
        onError: (err) =>
          toast.error(err.message || "Failed to update permissions"),
      },
    );
  };

  const handleFullAccessToggle = (value: boolean) => {
    updatePermissions(
      {
        familyId,
        member: memberPrincipal,
        permissions: {
          canAddMemories: value,
          canAddMeasurementsAndMilestones: value,
          canViewMeasurementsAndMilestones: value,
        },
      },
      {
        onSuccess: () => toast.success("Permissions updated"),
        onError: (err) =>
          toast.error(err.message || "Failed to update permissions"),
      },
    );
  };

  const handleRemove = () => {
    removeMember(
      { familyId, member: memberPrincipal },
      {
        onSuccess: () => {
          toast.success(`${member.displayName} removed from family`);
          setShowRemoveDialog(false);
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message || "Failed to remove member"),
      },
    );
  };

  const isBusy = isUpdatingPermissions || isUpdatingRelationship;

  return (
    <>
      <Sheet open={!!member} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{member.displayName}</SheetTitle>
            <SheetDescription>
              Manage relationship and permissions for this member.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 space-y-6">
            <div className="space-y-2">
              <Label>Relationship</Label>
              <Select
                value={currentRelationship}
                onValueChange={handleRelationshipChange}
                disabled={isBusy}
              >
                <SelectTrigger>
                  <SelectValue />
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

            <Separator />

            <div className="space-y-4">
              <Label>Permissions</Label>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Full access</p>
                  <p className="text-xs text-muted-foreground">
                    Enable all permissions
                  </p>
                </div>
                <Switch
                  checked={hasFullAccess}
                  onCheckedChange={handleFullAccessToggle}
                  disabled={isBusy}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm">Add moments</p>
                  <p className="text-xs text-muted-foreground">
                    Create and edit memories
                  </p>
                </div>
                <Switch
                  checked={canAddMemories}
                  onCheckedChange={(v) =>
                    handlePermissionToggle("canAddMemories", v)
                  }
                  disabled={isBusy}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm">Add measurements & milestones</p>
                  <p className="text-xs text-muted-foreground">
                    Record growth data and mark milestones
                  </p>
                </div>
                <Switch
                  checked={canAddMeasurementsAndMilestones}
                  onCheckedChange={(v) =>
                    handlePermissionToggle("canAddMeasurementsAndMilestones", v)
                  }
                  disabled={isBusy}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm">View measurements & milestones</p>
                  <p className="text-xs text-muted-foreground">
                    See growth charts, milestones, and timelines
                  </p>
                </div>
                <Switch
                  checked={canViewMeasurementsAndMilestones}
                  onCheckedChange={(v) =>
                    handlePermissionToggle(
                      "canViewMeasurementsAndMilestones",
                      v,
                    )
                  }
                  disabled={isBusy}
                />
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowRemoveDialog(true)}
              disabled={isBusy}
            >
              <Trash2 className="h-4 w-4" />
              Remove from Family
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {member.displayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This person will immediately lose access to the family. They would
              need a new invite code to rejoin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRemove();
              }}
              disabled={isRemoving}
            >
              {isRemoving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isRemoving ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

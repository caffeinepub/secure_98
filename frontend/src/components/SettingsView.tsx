import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppHeader } from "./AppHeader";
import { FamilyMembers } from "./FamilyMembers";
import { FamilyMembersList } from "./FamilyMembersList";
import { InviteCodeSection } from "./InviteCodeSection";
import { ExportDataButton } from "./ExportDataButton";
import { DeleteFamilyDialog } from "./DeleteFamilyDialog";
import { CreateFamilyDialog } from "./CreateFamilyDialog";
import { JoinFamilySettingsDialog } from "./JoinFamilySettingsDialog";

interface SettingsViewProps {
  activeFamilyId: bigint;
  familyName: string;
  isOwner: boolean;
  ownsAnyFamily: boolean;
}

export function SettingsView({
  activeFamilyId,
  familyName,
  isOwner,
  ownsAnyFamily,
}: SettingsViewProps) {
  const [showDeleteFamily, setShowDeleteFamily] = useState(false);
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [showJoinFamily, setShowJoinFamily] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto">
      <AppHeader title="Settings" />
      <div className="p-4 sm:px-6 max-w-2xl mx-auto space-y-6">
        <FamilyMembers familyId={activeFamilyId} />
        <Separator />
        <div className="space-y-1.5">
          <h2 className="font-semibold tracking-tight">Families</h2>
          <p className="text-sm text-muted-foreground">
            Create a new family or join one with an invite code.
          </p>
          <div className="flex gap-2">
            {!ownsAnyFamily && (
              <Button
                className="flex-1"
                onClick={() => setShowCreateFamily(true)}
              >
                <Plus className="h-4 w-4" />
                Create New Family
              </Button>
            )}
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowJoinFamily(true)}
            >
              <UserPlus className="h-4 w-4" />
              Join a Family
            </Button>
          </div>
        </div>
        <CreateFamilyDialog
          open={showCreateFamily}
          onOpenChange={setShowCreateFamily}
        />
        <JoinFamilySettingsDialog
          open={showJoinFamily}
          onOpenChange={setShowJoinFamily}
        />
        {isOwner && (
          <>
            <Separator />
            <FamilyMembersList familyId={activeFamilyId} />
            <Separator />
            <InviteCodeSection familyId={activeFamilyId} />
            <Separator />
            <div className="space-y-1.5">
              <h2 className="font-semibold tracking-tight">Data</h2>
              <ExportDataButton familyId={activeFamilyId} />
            </div>
            <Separator />
            <div className="space-y-1.5">
              <h2 className="font-semibold tracking-tight text-destructive">
                Danger Zone
              </h2>
              <p className="text-sm text-muted-foreground">
                Permanently delete this family and all its data.
              </p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteFamily(true)}
              >
                Delete Family
              </Button>
            </div>
            <DeleteFamilyDialog
              open={showDeleteFamily}
              onOpenChange={setShowDeleteFamily}
              familyId={activeFamilyId}
              familyName={familyName}
            />
          </>
        )}
      </div>
    </div>
  );
}

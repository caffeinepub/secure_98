import { useState } from "react";
import { Crown, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useFamilyMembers } from "../hooks/useQueries";
import { type FamilyMemberView, type Relationship } from "../backend";
import { MemberPermissionsSheet } from "./MemberPermissionsSheet";

function getRelationshipLabel(relationship: Relationship): string {
  return relationship.charAt(0).toUpperCase() + relationship.slice(1);
}

function getPermissionsSummary(member: FamilyMemberView): string {
  if (member.isOwner) return "Full access";
  const {
    canAddMemories,
    canAddMeasurementsAndMilestones,
    canViewMeasurementsAndMilestones,
  } = member.permissions;
  if (
    canAddMemories &&
    canAddMeasurementsAndMilestones &&
    canViewMeasurementsAndMilestones
  ) {
    return "Full access";
  }
  const parts: string[] = [];
  if (canAddMemories) parts.push("Add moments");
  if (canAddMeasurementsAndMilestones)
    parts.push("Add measurements & milestones");
  if (canViewMeasurementsAndMilestones)
    parts.push("View measurements & milestones");
  return parts.length > 0 ? parts.join(", ") : "View only";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function FamilyMembersList({ familyId }: { familyId: bigint }) {
  const { data: members, isLoading, isError } = useFamilyMembers(familyId);
  const [selectedPrincipal, setSelectedPrincipal] = useState<string | null>(
    null,
  );

  const selectedMember =
    members?.find((m) => m.principal.toString() === selectedPrincipal) ?? null;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" /> Members
        </h3>
        <div className="text-sm text-muted-foreground">Loading members...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" /> Members
        </h3>
        <div className="text-sm text-destructive">Failed to load members.</div>
      </div>
    );
  }

  if (!members || members.length === 0) return null;

  const sortedMembers = [...members].sort((a, b) => {
    if (a.isOwner && !b.isOwner) return -1;
    if (!a.isOwner && b.isOwner) return 1;
    return a.displayName.localeCompare(b.displayName);
  }) as FamilyMemberView[];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Users className="h-4 w-4" /> Members ({members.length})
      </h3>
      <div className="space-y-1">
        {sortedMembers.map((member) => (
          <Button
            key={member.principal.toString()}
            type="button"
            variant="ghost"
            className="w-full justify-start h-auto p-2.5 gap-3"
            onClick={() => {
              if (!member.isOwner)
                setSelectedPrincipal(member.principal.toString());
            }}
            disabled={member.isOwner}
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs">
                {getInitials(member.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium truncate">
                  {member.displayName}
                </span>
                {member.isOwner && (
                  <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {getRelationshipLabel(member.relationship)}
                </Badge>
                <span className="text-[11px] text-muted-foreground truncate">
                  {getPermissionsSummary(member)}
                </span>
              </div>
            </div>
          </Button>
        ))}
      </div>
      <MemberPermissionsSheet
        familyId={familyId}
        member={selectedMember}
        onOpenChange={(open) => {
          if (!open) setSelectedPrincipal(null);
        }}
      />
    </div>
  );
}

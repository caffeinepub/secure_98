import { useMemo, useState } from "react";
import {
  Award,
  Baby,
  Camera,
  Loader2,
  PawPrint,
  Ruler,
  Weight,
} from "lucide-react";
import { format, parseISO, differenceInMonths } from "date-fns";
import { PetSex } from "../backend";
import { PET_SEX_LABELS } from "../utils/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AppHeader } from "./AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  useFamilyDependents,
  useAchievedMilestoneKeys,
  useMemberMomentCount,
  useGrowthMeasurements,
} from "../hooks/useQueries";
import { MemberKind } from "../backend";
import { useAppStore } from "../stores/useAppStore";
import { StatItem } from "./StatItem";
import { UpcomingMilestones } from "./UpcomingMilestones";
import { MilestoneTimeline } from "./MilestoneTimeline";
import { CreateMemoryDialog } from "./CreateMemoryDialog";

interface MemberDetailProps {
  familyId: bigint;
  memberId: bigint;
  canViewMeasurementsAndMilestones: boolean;
}

export function MemberDetail({
  familyId,
  memberId,
  canViewMeasurementsAndMilestones,
}: MemberDetailProps) {
  const goHome = useAppStore((s) => s.goHome);
  const goToMilestonesList = useAppStore((s) => s.goToMilestonesList);
  const goToMilestoneDetail = useAppStore((s) => s.goToMilestoneDetail);
  const goToGrowthTracking = useAppStore((s) => s.goToGrowthTracking);
  const [captureMilestoneKey, setCaptureMilestoneKey] = useState<string | null>(
    null,
  );
  const {
    data: dependents,
    isLoading,
    isError,
  } = useFamilyDependents(familyId);

  const member = useMemo(() => {
    const dep = dependents?.find((d) => d.id === memberId);
    if (!dep) return null;
    return {
      kind: dep.kind,
      type:
        dep.kind === MemberKind.child ? ("child" as const) : ("pet" as const),
      name: dep.name,
      dateOfBirth: dep.dateOfBirth ?? null,
      photoUrl: dep.photoBlob?.getDirectURL() ?? null,
      petType: dep.petType ?? null,
      breed: dep.breed ?? null,
      sex: dep.sex ?? null,
      adoptionDate: dep.adoptionDate ?? null,
    };
  }, [dependents, memberId]);

  const {
    data: achievedKeys,
    isLoading: isLoadingAchievedKeys,
    isError: isAchievedError,
  } = useAchievedMilestoneKeys(
    canViewMeasurementsAndMilestones ? familyId : null,
    canViewMeasurementsAndMilestones ? memberId : null,
  );

  const {
    data: momentCount,
    isLoading: isLoadingMoments,
    isError: isMomentsError,
  } = useMemberMomentCount(familyId, memberId);

  const isChild = member?.type === "child";
  const isPet = member?.type === "pet";

  const {
    data: growthData,
    isLoading: isLoadingGrowth,
    isError: isGrowthError,
  } = useGrowthMeasurements(
    canViewMeasurementsAndMilestones ? familyId : null,
    canViewMeasurementsAndMilestones ? memberId : null,
  );

  if (isLoading) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 overflow-y-auto bg-background">
        <AppHeader title="Member" onBack={goHome} />
        <div className="p-8 text-center text-destructive">
          Failed to load member data.
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex-1 overflow-y-auto bg-background">
        <AppHeader title="Member" onBack={goHome} />
        <div className="p-8 text-center text-muted-foreground">
          Member not found.
        </div>
      </div>
    );
  }

  const initials = member.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const ageText = member.dateOfBirth ? formatAge(member.dateOfBirth) : null;

  const milestoneCount = isAchievedError ? 0 : (achievedKeys?.length ?? 0);
  const moments = isMomentsError
    ? null
    : momentCount != null
      ? Number(momentCount)
      : null;

  const weightCount = isGrowthError
    ? 0
    : (growthData?.filter((m) => m.weightKg != null).length ?? 0);
  const heightCount = isGrowthError
    ? 0
    : (growthData?.filter((m) => m.heightCm != null).length ?? 0);

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <AppHeader title={member.name} onBack={goHome} />

      <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto space-y-6">
        {/* Profile header */}
        <div className="flex flex-col items-center gap-3">
          <Avatar className="h-20 w-20">
            {member.photoUrl ? (
              <AvatarImage
                src={member.photoUrl}
                alt={member.name}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="text-xl font-semibold bg-muted text-muted-foreground">
              {initials ||
                (isChild ? (
                  <Baby className="h-8 w-8" />
                ) : (
                  <PawPrint className="h-8 w-8" />
                ))}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">
              {member.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isPet && member.petType ? member.petType : null}
              {isPet && member.petType && member.breed ? " · " : null}
              {isPet && member.breed ? member.breed : null}
              {isPet && (member.petType || member.breed) && member.dateOfBirth
                ? " · "
                : null}
              {member.dateOfBirth
                ? format(parseISO(member.dateOfBirth), "MMM d, yyyy")
                : null}
              {ageText ? ` (${ageText})` : null}
            </p>
            {isPet && (member.sex || member.adoptionDate) && (
              <p className="text-sm text-muted-foreground">
                {member.sex ? PET_SEX_LABELS[member.sex] : null}
                {member.sex && member.adoptionDate ? " · " : null}
                {member.adoptionDate
                  ? `Adopted ${format(parseISO(member.adoptionDate), "MMM d, yyyy")}`
                  : null}
              </p>
            )}
          </div>
        </div>

        {/* Stat summary bar */}
        <div
          className={cn(
            "grid gap-2 rounded-xl border border-border/50 bg-card p-3 shadow-sm",
            isChild ? "grid-cols-4" : "grid-cols-3",
          )}
        >
          <button
            type="button"
            className="cursor-pointer hover:bg-accent/50 rounded-lg transition-colors"
            onClick={() => goToGrowthTracking(memberId, "weight")}
          >
            <StatItem
              icon={<Weight className="h-5 w-5" />}
              label="Weight"
              value={
                canViewMeasurementsAndMilestones ? weightCount.toString() : "?"
              }
              loading={isLoadingGrowth && canViewMeasurementsAndMilestones}
            />
          </button>
          {isChild && (
            <button
              type="button"
              className="cursor-pointer hover:bg-accent/50 rounded-lg transition-colors"
              onClick={() => goToGrowthTracking(memberId, "height")}
            >
              <StatItem
                icon={<Ruler className="h-5 w-5" />}
                label="Height"
                value={
                  canViewMeasurementsAndMilestones
                    ? heightCount.toString()
                    : "?"
                }
                loading={isLoadingGrowth && canViewMeasurementsAndMilestones}
              />
            </button>
          )}
          <StatItem
            icon={<Award className="h-5 w-5" />}
            label="Milestones"
            value={
              canViewMeasurementsAndMilestones ? milestoneCount.toString() : "?"
            }
            loading={isLoadingAchievedKeys && canViewMeasurementsAndMilestones}
          />
          <StatItem
            icon={<Camera className="h-5 w-5" />}
            label="Moments"
            value={moments != null ? moments.toString() : "?"}
            loading={isLoadingMoments}
          />
        </div>

        {/* Milestones tabs */}
        {canViewMeasurementsAndMilestones && (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="upcoming" className="flex-1">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex-1">
                Timeline
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              <UpcomingMilestones
                familyId={familyId}
                memberId={memberId}
                memberKind={member.kind}
                dateOfBirth={member.dateOfBirth}
                onSeeAll={() => goToMilestonesList(memberId)}
                onCaptureMilestone={(key) => setCaptureMilestoneKey(key)}
                onViewMilestone={(key) => goToMilestoneDetail(memberId, key)}
              />
            </TabsContent>
            <TabsContent value="timeline">
              <MilestoneTimeline familyId={familyId} memberId={memberId} />
            </TabsContent>
          </Tabs>
        )}
      </div>
      <CreateMemoryDialog
        open={captureMilestoneKey !== null}
        onOpenChange={(open) => {
          if (!open) setCaptureMilestoneKey(null);
        }}
        milestoneKey={captureMilestoneKey ?? undefined}
        milestoneMemberId={memberId}
      />
    </div>
  );
}

function formatAge(dateOfBirth: string): string {
  const dob = parseISO(dateOfBirth);
  const now = new Date();
  const months = differenceInMonths(now, dob);
  if (months < 1) {
    return "Newborn";
  }
  if (months < 24) {
    return `${months}mo`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return `${years}y`;
  }
  return `${years}y ${remainingMonths}mo`;
}

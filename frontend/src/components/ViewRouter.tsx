import { useAppStore } from "../stores/useAppStore";
import { CalendarView } from "./CalendarView";
import { CreateMemoryDialog } from "./CreateMemoryDialog";
import { DayDetail } from "./DayDetail";
import { FeedView } from "./FeedView";
import { GalleryView } from "./GalleryView";
import { GrowthTracking } from "./GrowthTracking";
import { MemberDetail } from "./MemberDetail";
import { MilestoneDetail } from "./MilestoneDetail";
import { MilestonesList } from "./MilestonesList";
import { SearchView } from "./SearchView";
import { SettingsView } from "./SettingsView";

interface Family {
  id: bigint;
  name: string;
  owner: { toString(): string };
}

interface Permissions {
  canAddMemories: boolean;
  canViewMeasurementsAndMilestones: boolean;
  canAddMeasurementsAndMilestones: boolean;
}

interface ViewRouterProps {
  families: Family[];
  activeFamilyId: bigint;
  isOwner: boolean;
  ownsAnyFamily: boolean;
  permissions: Permissions;
  showCreateMemory: boolean;
  onCreateMemoryChange: (open: boolean) => void;
}

export function ViewRouter({
  families,
  activeFamilyId,
  isOwner,
  ownsAnyFamily,
  permissions,
  showCreateMemory,
  onCreateMemoryChange,
}: ViewRouterProps) {
  const {
    currentView,
    homeView,
    selectedDate,
    selectedMemberId,
    selectedMilestoneKey,
    selectedGrowthMetric,
    setActiveFamilyId,
  } = useAppStore();

  function renderView() {
    switch (currentView) {
      case "day-detail":
        return (
          <DayDetail
            canAddMemories={permissions.canAddMemories}
            isOwner={isOwner}
            onNewMemory={() => onCreateMemoryChange(true)}
          />
        );

      case "member-detail":
        if (selectedMemberId === null) return null;
        return (
          <MemberDetail
            familyId={activeFamilyId}
            memberId={selectedMemberId}
            canViewMeasurementsAndMilestones={
              permissions.canViewMeasurementsAndMilestones
            }
          />
        );

      case "milestones-list":
        if (selectedMemberId === null) return null;
        return (
          <MilestonesList
            familyId={activeFamilyId}
            memberId={selectedMemberId}
            canAddMeasurementsAndMilestones={
              permissions.canAddMeasurementsAndMilestones
            }
          />
        );

      case "milestone-detail":
        if (selectedMemberId === null || selectedMilestoneKey === null)
          return null;
        return (
          <MilestoneDetail
            familyId={activeFamilyId}
            memberId={selectedMemberId}
            milestoneKey={selectedMilestoneKey}
            canAddMeasurementsAndMilestones={
              permissions.canAddMeasurementsAndMilestones
            }
            isOwner={isOwner}
          />
        );

      case "growth-tracking":
        if (selectedMemberId === null) return null;
        return (
          <GrowthTracking
            familyId={activeFamilyId}
            dependentId={selectedMemberId}
            canAddMeasurementsAndMilestones={
              permissions.canAddMeasurementsAndMilestones
            }
            initialMetric={selectedGrowthMetric}
          />
        );

      case "settings":
        return (
          <SettingsView
            activeFamilyId={activeFamilyId}
            familyName={
              families.find((f) => f.id === activeFamilyId)?.name ?? ""
            }
            isOwner={isOwner}
            ownsAnyFamily={ownsAnyFamily}
          />
        );

      case "search":
        return <SearchView familyId={activeFamilyId} />;

      default:
        return homeView === "feed" ? (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <FeedView
              familyId={activeFamilyId}
              memberId={null}
              canAddMemories={permissions.canAddMemories}
              isOwner={isOwner}
              onNewMemory={() => onCreateMemoryChange(true)}
            />
          </div>
        ) : homeView === "gallery" ? (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <GalleryView familyId={activeFamilyId} memberId={null} />
          </div>
        ) : (
          <CalendarView
            familyId={activeFamilyId}
            className="flex-1 min-h-0 px-2 sm:px-4 pb-2"
          />
        );
    }
  }

  return (
    <>
      {renderView()}
      <CreateMemoryDialog
        open={showCreateMemory}
        onOpenChange={onCreateMemoryChange}
        defaultDate={
          currentView === "day-detail" ? (selectedDate ?? undefined) : undefined
        }
      />
    </>
  );
}

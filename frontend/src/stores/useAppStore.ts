import { create } from "zustand";
import { persist } from "zustand/middleware";

type View =
  | "home"
  | "day-detail"
  | "member-detail"
  | "milestones-list"
  | "milestone-detail"
  | "growth-tracking"
  | "settings"
  | "search";

type HomeView = "calendar" | "feed" | "gallery";

type GrowthMetric = "height" | "weight";

function today() {
  return new Date().toISOString().slice(0, 10);
}

interface AppState {
  currentView: View;
  homeView: HomeView;
  selectedDate: string | null;
  selectedMemberId: bigint | null;
  selectedMilestoneKey: string | null;
  selectedGrowthMetric: GrowthMetric;
  activeFamilyId: bigint | null;
  flashbackDismissedDate: string | null;

  setActiveFamilyId: (id: bigint) => void;
  setHomeView: (view: HomeView) => void;
  reset: () => void;
  goHome: () => void;
  goToDay: (date: string) => void;
  goToMember: (id: bigint) => void;
  goToMilestonesList: (memberId: bigint) => void;
  goToMilestoneDetail: (memberId: bigint, milestoneKey: string) => void;
  goToGrowthTracking: (memberId: bigint, metric?: GrowthMetric) => void;
  goToSettings: () => void;
  goToSearch: () => void;
  dismissFlashback: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentView: "home",
      homeView: "calendar",
      selectedDate: null,
      selectedMemberId: null,
      selectedMilestoneKey: null,
      selectedGrowthMetric: "height",
      activeFamilyId: null,
      flashbackDismissedDate: null,

      setActiveFamilyId: (id) => {
        const prev = get().activeFamilyId;
        set({
          activeFamilyId: id,
          currentView: "home",
          homeView: "calendar",
          selectedDate: null,
          selectedMemberId: null,
          selectedMilestoneKey: null,
          selectedGrowthMetric: "height",
          // Only reset flashback when actually switching families
          ...(prev !== null && prev !== id
            ? { flashbackDismissedDate: null }
            : {}),
        });
      },

      setHomeView: (view) => set({ homeView: view, currentView: "home" }),

      reset: () =>
        set({
          currentView: "home",
          homeView: "calendar",
          selectedDate: null,
          selectedMemberId: null,
          selectedMilestoneKey: null,
          activeFamilyId: null,
        }),

      goHome: () =>
        set({
          currentView: "home",
          selectedDate: null,
          selectedMemberId: null,
          selectedMilestoneKey: null,
        }),

      goToDay: (date) => set({ currentView: "day-detail", selectedDate: date }),

      goToMember: (id) =>
        set({ currentView: "member-detail", selectedMemberId: id }),

      goToMilestonesList: (memberId) =>
        set({ currentView: "milestones-list", selectedMemberId: memberId }),

      goToMilestoneDetail: (memberId, milestoneKey) =>
        set({
          currentView: "milestone-detail",
          selectedMemberId: memberId,
          selectedMilestoneKey: milestoneKey,
        }),

      goToGrowthTracking: (memberId, metric) =>
        set({
          currentView: "growth-tracking",
          selectedMemberId: memberId,
          selectedGrowthMetric: metric ?? "height",
        }),

      goToSettings: () => set({ currentView: "settings" }),

      goToSearch: () => set({ currentView: "search" }),

      dismissFlashback: () => set({ flashbackDismissedDate: today() }),
    }),
    {
      name: "secure-app-store",
      partialize: (state) => ({
        flashbackDismissedDate: state.flashbackDismissedDate,
      }),
    },
  ),
);

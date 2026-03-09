import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useProfile,
  useUserFamilies,
  useMyPermissions,
} from "../hooks/useQueries";
import { useAppStore } from "../stores/useAppStore";
import { ProfileSetupDialog } from "./ProfileSetupDialog";
import { FamilySetupFlow } from "./FamilySetupFlow";
import { SidebarRail } from "./SidebarRail";
import { HomeHeader } from "./HomeHeader";
import { ViewRouter } from "./ViewRouter";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

function getRailView(currentView: string): "home" | "search" | "settings" {
  if (currentView === "search") return "search";
  if (currentView === "settings") return "settings";
  return "home";
}

export function MainApp() {
  const { clear, identity } = useInternetIdentity();
  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isProfileError,
  } = useProfile();
  const {
    data: families,
    isLoading: isLoadingFamilies,
    isError: isFamiliesError,
  } = useUserFamilies();
  const queryClient = useQueryClient();
  const {
    activeFamilyId,
    setActiveFamilyId,
    currentView,
    homeView,
    setHomeView,
    reset,
  } = useAppStore();
  const { data: myPermissions, isError: isPermissionsError } =
    useMyPermissions(activeFamilyId);
  const [showSetupFlow, setShowSetupFlow] = useState(false);
  const [showCreateMemory, setShowCreateMemory] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const canAddMemories = myPermissions?.canAddMemories ?? false;
  const hasProfile = profile && profile.name;
  const activeFamily = families?.find((f) => f.id === activeFamilyId);
  const principalStr = identity?.getPrincipal().toString();
  const isOwner = activeFamily?.owner.toString() === principalStr;
  const ownsAnyFamily =
    families?.some((f) => f.owner.toString() === principalStr) ?? false;

  const handleLogout = () => {
    queryClient.clear();
    reset();
    clear();
  };

  useEffect(() => {
    if (!families) return;
    if (families.length === 0 && activeFamilyId === null) {
      setShowSetupFlow(true);
    } else if (activeFamilyId === null && families.length > 0) {
      setActiveFamilyId(families[0].id);
    }
  }, [families, activeFamilyId, setActiveFamilyId]);

  if (isLoadingProfile || isLoadingFamilies) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isProfileError || isFamiliesError || isPermissionsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive">Failed to load data.</p>
          <Button
            variant="link"
            size="sm"
            onClick={() => window.location.reload()}
            className="mt-2 text-muted-foreground"
          >
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return <ProfileSetupDialog open />;
  }

  if (showSetupFlow) {
    return (
      <FamilySetupFlow
        onComplete={() => {
          setShowSetupFlow(false);
        }}
        onLogout={handleLogout}
      />
    );
  }

  const railView = getRailView(currentView);

  return (
    <>
      <div className="flex h-dvh bg-background overflow-hidden">
        <SidebarRail
          activeView={railView}
          homeView={homeView}
          profileName={profile?.name ?? null}
          profilePhotoUrl={profile?.photoBlob?.getDirectURL() ?? null}
          onNewMemory={() => setShowCreateMemory(true)}
          onSignOut={handleLogout}
          onEditProfile={() => setShowEditProfile(true)}
          onHomeViewChange={setHomeView}
          canAddMemories={canAddMemories}
        />
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {activeFamilyId !== null && (
            <>
              <HomeHeader
                families={families ?? []}
                activeFamilyId={activeFamilyId}
                onFamilyChange={setActiveFamilyId}
              />
              <ViewRouter
                families={families ?? []}
                activeFamilyId={activeFamilyId}
                isOwner={isOwner}
                ownsAnyFamily={ownsAnyFamily}
                permissions={{
                  canAddMemories,
                  canViewMeasurementsAndMilestones:
                    myPermissions?.canViewMeasurementsAndMilestones ?? false,
                  canAddMeasurementsAndMilestones:
                    myPermissions?.canAddMeasurementsAndMilestones ?? false,
                }}
                showCreateMemory={showCreateMemory}
                onCreateMemoryChange={setShowCreateMemory}
              />
            </>
          )}
        </main>
      </div>
      <ProfileSetupDialog
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
        defaultName={profile?.name ?? ""}
        defaultPhotoUrl={profile?.photoBlob?.getDirectURL() ?? null}
        defaultPhotoBlob={profile?.photoBlob ?? null}
      />
    </>
  );
}

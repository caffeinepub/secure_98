import {
  CalendarDays,
  LayoutGrid,
  List,
  LogOut,
  Moon,
  Pencil,
  Plus,
  Search,
  Settings,
  Shield,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "../stores/useAppStore";

type RailView = "home" | "search" | "settings";
type HomeView = "calendar" | "feed" | "gallery";

interface SidebarRailProps {
  activeView: RailView;
  homeView: HomeView;
  profileName: string | null;
  profilePhotoUrl?: string | null;
  onNewMemory: () => void;
  onSignOut: () => void;
  onEditProfile: () => void;
  onHomeViewChange: (view: HomeView) => void;
  canAddMemories: boolean;
}

export function SidebarRail({
  activeView,
  homeView,
  profileName,
  profilePhotoUrl,
  onNewMemory,
  onSignOut,
  onEditProfile,
  onHomeViewChange,
  canAddMemories,
}: SidebarRailProps) {
  const goHome = useAppStore((s) => s.goHome);
  const goToSearch = useAppStore((s) => s.goToSearch);
  const goToSettings = useAppStore((s) => s.goToSettings);
  const { theme, setTheme } = useTheme();

  const viewItems = [
    { id: "calendar" as const, icon: CalendarDays, label: "Calendar" },
    { id: "feed" as const, icon: List, label: "Feed" },
    { id: "gallery" as const, icon: LayoutGrid, label: "Gallery" },
  ];

  const initials = profileName ? profileName.charAt(0).toUpperCase() : "?";

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="shrink-0 w-11 sm:w-12 h-dvh bg-sidebar border-r border-sidebar-border flex flex-col items-center py-3 gap-1">
        <button
          onClick={goHome}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary flex items-center justify-center mb-4"
        >
          <Shield className="w-4 h-4 text-primary-foreground" />
        </button>

        {viewItems.map((item) => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onHomeViewChange(item.id)}
                className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-colors",
                  activeView === "home" && homeView === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <item.icon className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ))}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={goToSearch}
              className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-colors mt-1",
                activeView === "search"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <Search className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Search</TooltipContent>
        </Tooltip>

        {canAddMemories && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onNewMemory}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center mt-1 hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">New Memory</TooltipContent>
          </Tooltip>
        )}

        <div className="flex-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="w-4 h-4 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Toggle theme</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={goToSettings}
              className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-colors",
                activeView === "settings"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <Settings className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>

        <Popover>
          <PopoverTrigger asChild>
            <button className="mt-1">
              <Avatar className="w-8 h-8 sm:w-9 sm:h-9 cursor-pointer hover:ring-2 hover:ring-sidebar-ring/30 hover:ring-offset-1 hover:ring-offset-sidebar transition-all">
                {profilePhotoUrl ? (
                  <AvatarImage
                    src={profilePhotoUrl}
                    alt={profileName ?? "Profile"}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="text-xs font-medium bg-sidebar-accent text-sidebar-accent-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="end" className="w-48 p-2">
            <p className="text-sm font-medium px-2 py-1.5 truncate">
              Welcome, {profileName ?? "User"}!
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm"
              onClick={onEditProfile}
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm"
              onClick={onSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </PopoverContent>
        </Popover>
      </aside>
    </TooltipProvider>
  );
}

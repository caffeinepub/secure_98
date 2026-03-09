import { useState } from "react";
import { Baby, Check, ChevronDown, PawPrint, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useFamilyDependents } from "../hooks/useQueries";
import { MemberKind } from "../backend";
import { useAppStore } from "../stores/useAppStore";
import { AddMemberDialog, type MemberType } from "./AddMemberDialog";

interface Family {
  id: bigint;
  name: string;
}

interface HomeHeaderProps {
  families: Family[];
  activeFamilyId: bigint;
  onFamilyChange: (id: bigint) => void;
}

export function HomeHeader({
  families,
  activeFamilyId,
  onFamilyChange,
}: HomeHeaderProps) {
  const goToMember = useAppStore((s) => s.goToMember);
  const { data: dependents, isError: isDependentsError } =
    useFamilyDependents(activeFamilyId);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addType, setAddType] = useState<MemberType>("child");

  const activeFamily = families.find((f) => f.id === activeFamilyId);
  const familyName = activeFamily?.name ?? "Secure";
  const hasMultipleFamilies = families.length >= 2;

  const openAddDialog = (type: MemberType) => {
    setAddType(type);
    setAddDialogOpen(true);
  };

  return (
    <>
      <header className="shrink-0 bg-background border-b border-border/50">
        <div className="flex items-center px-4 sm:px-6 py-2 gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0 overflow-x-auto scrollbar-none">
            {isDependentsError && (
              <span className="text-xs text-destructive self-center">
                Failed to load members
              </span>
            )}
            {dependents?.map((dep) => (
              <MemberChip
                key={`dep-${dep.id}`}
                onClick={() => goToMember(dep.id)}
                photoUrl={dep.photoBlob?.getDirectURL() ?? null}
                initials={dep.name.charAt(0).toUpperCase()}
                fallbackIcon={
                  dep.kind === MemberKind.child ? (
                    <Baby className="h-3.5 w-3.5" />
                  ) : (
                    <PawPrint className="h-3.5 w-3.5" />
                  )
                }
                label={dep.name}
              />
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
                  <div className="h-10 w-10 rounded-full border border-dashed border-border flex items-center justify-center hover:bg-accent transition-colors">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-[10px] leading-tight text-muted-foreground">
                    Add
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => openAddDialog("child")}>
                  <Baby className="h-4 w-4" />
                  Add Child
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openAddDialog("pet")}>
                  <PawPrint className="h-4 w-4" />
                  Add Pet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="shrink-0">
            {hasMultipleFamilies ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 font-semibold tracking-tight truncate max-w-[200px] hover:text-primary transition-colors">
                    {familyName}
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {families.map((family) => (
                    <DropdownMenuItem
                      key={family.id.toString()}
                      onClick={() => onFamilyChange(family.id)}
                      className={cn(
                        family.id === activeFamilyId && "font-medium",
                      )}
                    >
                      {family.id === activeFamilyId && (
                        <Check className="h-4 w-4" />
                      )}
                      {family.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <span className="font-semibold tracking-tight truncate max-w-[200px]">
                {familyName} Family
              </span>
            )}
          </div>
        </div>
      </header>

      <AddMemberDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        familyId={activeFamilyId}
        type={addType}
      />
    </>
  );
}

function MemberChip({
  onClick,
  photoUrl,
  initials,
  fallbackIcon,
  label,
}: {
  onClick: () => void;
  photoUrl?: string | null;
  initials?: string;
  fallbackIcon?: React.ReactNode;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="flex flex-col items-center gap-1 shrink-0 group h-auto p-1"
    >
      <Avatar className="h-10 w-10 transition-all group-hover:ring-2 group-hover:ring-primary/30 group-hover:ring-offset-2 group-hover:ring-offset-background">
        {photoUrl ? (
          <AvatarImage src={photoUrl} alt={label} className="object-cover" />
        ) : null}
        <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
          {initials ?? fallbackIcon}
        </AvatarFallback>
      </Avatar>
      <span className="text-[10px] leading-tight max-w-[48px] truncate text-muted-foreground">
        {label}
      </span>
    </Button>
  );
}

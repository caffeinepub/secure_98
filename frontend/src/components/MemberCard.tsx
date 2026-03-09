import { Baby, PawPrint, Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MemberCardProps {
  name: string;
  type: "child" | "pet";
  dateOfBirth: string | null;
  petType?: string;
  breed?: string;
  photoUrl?: string | null;
  onEdit: () => void;
  onRemove: () => void;
}

export function MemberCard({
  name,
  type,
  dateOfBirth,
  petType,
  breed,
  photoUrl,
  onEdit,
  onRemove,
}: MemberCardProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 shadow-sm">
      <Avatar className="h-10 w-10 shrink-0">
        {photoUrl ? (
          <AvatarImage src={photoUrl} alt={name} className="object-cover" />
        ) : null}
        <AvatarFallback>
          {initials ||
            (type === "child" ? (
              <Baby className="h-4 w-4" />
            ) : (
              <PawPrint className="h-4 w-4" />
            ))}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground">
          {type === "pet" && petType ? petType : null}
          {type === "pet" && petType && breed ? " · " : null}
          {type === "pet" && breed ? breed : null}
          {type === "pet" && (petType || breed) && dateOfBirth ? " · " : null}
          {dateOfBirth ? format(parseISO(dateOfBirth), "MMM d, yyyy") : null}
        </p>
      </div>
      <Badge variant="secondary" className="shrink-0">
        {type === "child" ? "Child" : "Pet"}
      </Badge>
      <div className="flex gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

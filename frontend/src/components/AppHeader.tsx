import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  children?: React.ReactNode;
}

export function AppHeader({ title, onBack, children }: AppHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background shrink-0">
      <div className="relative flex items-center justify-center mx-auto max-w-2xl h-11">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 h-8 w-8"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <span className="font-semibold text-[15px]">{title}</span>
        {children && (
          <div className="absolute right-4 flex items-center gap-1">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

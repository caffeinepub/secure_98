import { Loader2 } from "lucide-react";

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  loading: boolean;
}

export function StatItem({ icon, label, value, loading }: StatItemProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-2">
      <div className="text-muted-foreground">{icon}</div>
      <span className="text-lg font-semibold tabular-nums">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : value}
      </span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

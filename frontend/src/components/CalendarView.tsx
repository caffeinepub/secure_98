import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isToday,
  isSameMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMonthSummary, useFlashbacks } from "../hooks/useQueries";
import { useAppStore } from "../stores/useAppStore";
import { FlashbackCard } from "./FlashbackCard";

export type DaySummaryInfo = {
  memoryCount: number;
  previewUrl: string | null;
  previewCaption: string | null;
};

interface CalendarViewProps {
  familyId: bigint;
  className?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getCalendarWeeks(month: Date): Date[][] {
  const start = startOfWeek(startOfMonth(month));
  const end = endOfWeek(endOfMonth(month));
  const weeks: Date[][] = [];
  let current = start;
  while (current <= end) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(current);
      current = addDays(current, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function CalendarView({ familyId, className }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const goToDay = useAppStore((s) => s.goToDay);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const flashbackDismissedDate = useAppStore((s) => s.flashbackDismissedDate);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;

  const todayStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const {
    data: summary,
    isLoading,
    isError,
  } = useMonthSummary(familyId, year, month, null);

  const { data: flashbacks, isError: flashbacksError } = useFlashbacks(
    familyId,
    todayStr,
  );

  const summaryMap = useMemo(() => {
    const map = new Map<string, DaySummaryInfo>();
    if (summary) {
      for (const day of summary) {
        map.set(day.date, {
          memoryCount: Number(day.memoryCount),
          previewUrl: day.previewBlob?.getDirectURL() ?? null,
          previewCaption: day.previewCaption ?? null,
        });
      }
    }
    return map;
  }, [summary]);

  const weeks = useMemo(() => getCalendarWeeks(currentMonth), [currentMonth]);

  const handleDayClick = (date: Date) => {
    goToDay(format(date, "yyyy-MM-dd"));
  };

  if (isError) {
    return (
      <div className="text-destructive text-center py-8">
        Failed to load calendar data.
      </div>
    );
  }

  const showFlashbacks =
    flashbackDismissedDate !== todayStr &&
    !flashbacksError &&
    flashbacks &&
    flashbacks.length > 0;

  return (
    <div className={cn("flex flex-col", className)}>
      {showFlashbacks && <FlashbackCard memories={flashbacks} />}

      {/* Month navigation */}
      <div className="flex items-center justify-between px-2 h-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold select-none">
          {format(currentMonth, "MMMM yyyy")}
          {isLoading && (
            <Loader2 className="inline-block ml-2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground select-none pb-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid — fills remaining space */}
      <div className="flex-1 min-h-0 grid grid-cols-7 auto-rows-fr">
        {weeks.flat().map((date) => {
          const dateKey = format(date, "yyyy-MM-dd");
          const inMonth = isSameMonth(date, currentMonth);
          const today = isToday(date);
          const selected = selectedDate === dateKey;
          const info = summaryMap.get(dateKey);

          const hasImage = info?.previewUrl && inMonth;
          const hasCaption =
            !info?.previewUrl && info?.previewCaption && inMonth;

          return (
            <div
              key={dateKey}
              className="flex items-center justify-center p-0.5"
            >
              <button
                onClick={() => handleDayClick(date)}
                className={cn(
                  "h-full aspect-square max-w-full rounded-lg text-sm transition-colors relative overflow-hidden",
                  hasImage
                    ? "ring-2 ring-primary"
                    : "flex flex-col items-center justify-center",
                  !hasImage && inMonth
                    ? "text-foreground"
                    : !hasImage
                      ? "text-muted-foreground/40"
                      : "",
                  !hasImage &&
                    hasCaption &&
                    !selected &&
                    "bg-accent text-accent-foreground",
                  !hasImage &&
                    today &&
                    !selected &&
                    !hasCaption &&
                    "bg-accent text-accent-foreground",
                  !hasImage && selected && "bg-primary text-primary-foreground",
                  !hasImage &&
                    !selected &&
                    !hasCaption &&
                    inMonth &&
                    "hover:bg-accent/50",
                )}
              >
                {hasImage ? (
                  <>
                    <img
                      src={info.previewUrl!}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <span
                      className={cn(
                        "absolute top-0.5 right-1 text-xs font-semibold",
                        "bg-black/50 text-white rounded px-0.5 leading-tight",
                      )}
                    >
                      {date.getDate()}
                    </span>
                  </>
                ) : hasCaption ? (
                  <>
                    <span className="text-lg leading-none text-accent-foreground/60">
                      {"\u201C\u201D"}
                    </span>
                    <span>{date.getDate()}</span>
                  </>
                ) : (
                  <>
                    <span>{date.getDate()}</span>
                    {info && inMonth && (
                      <span className="flex items-center gap-0.5 h-2.5">
                        <span className="h-1 w-1 rounded-full bg-primary" />
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

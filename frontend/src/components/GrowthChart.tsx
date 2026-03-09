import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Dot } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { MemberKind } from "../backend";
import type { GrowthMetric } from "./AddGrowthDialog";

interface Measurement {
  id: bigint;
  date: string;
  heightCm?: number | null;
  weightKg?: number | null;
}

interface GrowthChartProps {
  measurements: Measurement[];
  memberKind: MemberKind;
  activeMetric?: GrowthMetric;
}

export function GrowthChart({
  measurements,
  memberKind,
  activeMetric = "weight",
}: GrowthChartProps) {
  const isChild = memberKind === MemberKind.child;

  const chartConfig = useMemo(
    () =>
      ({
        heightCm: {
          label: "Height (cm)",
          color: "var(--chart-3)",
        },
        weightKg: {
          label: isChild ? "Weight (kg)" : "Weight (lbs)",
          color: "var(--chart-1)",
        },
      }) satisfies ChartConfig,
    [isChild],
  );

  const chartData = useMemo(() => {
    const sorted = [...measurements].sort(
      (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime(),
    );
    return sorted.map((m) => ({
      date: m.date,
      label: format(parseISO(m.date), "MMM d, yyyy"),
      heightCm: m.heightCm,
      weightKg: m.weightKg,
    }));
  }, [measurements]);

  const showHeight = isChild && activeMetric === "height";
  const showWeight = !isChild || activeMetric === "weight";

  if (chartData.length < 2) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Add at least 2 measurements to see a chart.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">
        {isChild
          ? activeMetric === "height"
            ? "Height Chart"
            : "Weight Chart"
          : "Weight Chart"}
      </h3>

      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 8, bottom: 0, left: -8 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => format(parseISO(v), "MMM d")}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          {showHeight && (
            <YAxis
              yAxisId="height"
              orientation="left"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              domain={["auto", "auto"]}
              unit=" cm"
              width={56}
            />
          )}
          {showWeight && (
            <YAxis
              yAxisId="weight"
              orientation={showHeight ? "right" : "left"}
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              domain={["auto", "auto"]}
              unit={isChild ? " kg" : " lbs"}
              width={56}
            />
          )}
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  if (payload?.[0]?.payload?.label) {
                    return payload[0].payload.label;
                  }
                  return String(_);
                }}
              />
            }
          />
          {showHeight && (
            <Line
              yAxisId="height"
              type="monotone"
              dataKey="heightCm"
              stroke="var(--color-heightCm)"
              strokeWidth={2}
              dot={<Dot r={4} />}
              activeDot={{ r: 6 }}
              connectNulls
            />
          )}
          {showWeight && (
            <Line
              yAxisId="weight"
              type="monotone"
              dataKey="weightKg"
              stroke="var(--color-weightKg)"
              strokeWidth={2}
              dot={<Dot r={4} />}
              activeDot={{ r: 6 }}
              connectNulls
            />
          )}
        </LineChart>
      </ChartContainer>
    </div>
  );
}

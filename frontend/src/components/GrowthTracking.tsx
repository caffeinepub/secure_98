import { useState } from "react";
import { Loader2, Plus, Ruler, Trash2, Weight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MemberKind } from "../backend";
import {
  useFamilyDependents,
  useGrowthMeasurements,
  useDeleteGrowthMeasurement,
} from "../hooks/useQueries";
import { useAppStore } from "../stores/useAppStore";
import { AppHeader } from "./AppHeader";
import { AddGrowthDialog, type GrowthMetric } from "./AddGrowthDialog";
import { GrowthChart } from "./GrowthChart";

interface GrowthTrackingProps {
  familyId: bigint;
  dependentId: bigint;
  canAddMeasurementsAndMilestones: boolean;
  initialMetric?: GrowthMetric;
}

export function GrowthTracking({
  familyId,
  dependentId,
  canAddMeasurementsAndMilestones,
  initialMetric = "height",
}: GrowthTrackingProps) {
  const goBack = useAppStore((s) => s.goToMember);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [activeMetric, setActiveMetric] = useState<GrowthMetric>(initialMetric);

  const { data: dependents, isError: isDependentsError } =
    useFamilyDependents(familyId);
  const dependent = dependents?.find((c) => c.id === dependentId);
  const memberName = dependent?.name ?? "Member";
  const memberKind = dependent?.kind ?? MemberKind.child;
  const isChild = memberKind === MemberKind.child;

  const {
    data: measurements,
    isLoading,
    isError,
  } = useGrowthMeasurements(familyId, dependentId);

  const { mutate: deleteMeasurement, isPending: isDeleting } =
    useDeleteGrowthMeasurement();

  const handleDelete = () => {
    if (deletingId === null) return;
    deleteMeasurement(
      { familyId, measurementId: deletingId },
      {
        onSuccess: () => {
          toast.success("Measurement deleted");
          setDeletingId(null);
        },
        onError: () => {
          toast.error("Failed to delete measurement");
        },
      },
    );
  };

  const renderMeasurementTable = (
    metric: GrowthMetric,
    rows: NonNullable<typeof measurements>,
  ) => {
    const isHeight = metric === "height";
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">
              {isHeight ? "Height (cm)" : `Weight (${isChild ? "kg" : "lbs"})`}
            </TableHead>
            {canAddMeasurementsAndMilestones && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((m) => (
            <TableRow key={m.id.toString()}>
              <TableCell className="font-medium">
                {format(parseISO(m.date), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {isHeight
                  ? m.heightCm != null
                    ? m.heightCm.toFixed(1)
                    : "—"
                  : m.weightKg != null
                    ? m.weightKg.toFixed(2)
                    : "—"}
              </TableCell>
              {canAddMeasurementsAndMilestones && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeletingId(m.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderMetricContent = (metric: GrowthMetric) => {
    const filtered = (measurements ?? []).filter((m) =>
      metric === "height" ? m.heightCm != null : m.weightKg != null,
    );

    if (filtered.length === 0) {
      return (
        <div className="text-center py-12 space-y-3">
          <div className="flex justify-center text-muted-foreground">
            {metric === "height" ? (
              <Ruler className="h-8 w-8" />
            ) : (
              <Weight className="h-8 w-8" />
            )}
          </div>
          <p className="text-muted-foreground">
            No {metric} measurements recorded yet.
          </p>
          {canAddMeasurementsAndMilestones && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add First Measurement
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <GrowthChart
          measurements={filtered}
          memberKind={memberKind}
          activeMetric={metric}
        />
        {renderMeasurementTable(metric, filtered)}
      </div>
    );
  };

  const renderPetContent = () => {
    if (!measurements || measurements.length === 0) {
      return (
        <div className="text-center py-12 space-y-3">
          <div className="flex justify-center text-muted-foreground">
            <Weight className="h-8 w-8" />
          </div>
          <p className="text-muted-foreground">No measurements recorded yet.</p>
          {canAddMeasurementsAndMilestones && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add First Measurement
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <GrowthChart measurements={measurements} memberKind={memberKind} />
        {renderMeasurementTable("weight", measurements)}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <AppHeader
        title={`${memberName} — ${isChild ? "Growth" : "Weight"}`}
        onBack={() => goBack(dependentId)}
      >
        {canAddMeasurementsAndMilestones && (
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </AppHeader>

      <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError || isDependentsError ? (
          <div className="text-center py-12 text-destructive">
            Failed to load growth data.
          </div>
        ) : isChild ? (
          <Tabs
            value={activeMetric}
            onValueChange={(v) => setActiveMetric(v as GrowthMetric)}
          >
            <TabsList className="w-full">
              <TabsTrigger value="height" className="flex-1 gap-1.5">
                <Ruler className="h-3.5 w-3.5" />
                Height
              </TabsTrigger>
              <TabsTrigger value="weight" className="flex-1 gap-1.5">
                <Weight className="h-3.5 w-3.5" />
                Weight
              </TabsTrigger>
            </TabsList>
            <TabsContent value="height" className="mt-4">
              {renderMetricContent("height")}
            </TabsContent>
            <TabsContent value="weight" className="mt-4">
              {renderMetricContent("weight")}
            </TabsContent>
          </Tabs>
        ) : (
          renderPetContent()
        )}
      </div>

      <AddGrowthDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        familyId={familyId}
        dependentId={dependentId}
        memberKind={memberKind}
        metric={isChild ? activeMetric : "weight"}
      />

      <AlertDialog
        open={deletingId !== null}
        onOpenChange={() => setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete measurement?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useActor } from "../hooks/useActor";
import { useFamilyDependents } from "../hooks/useQueries";
import { fromNanoseconds } from "../utils/formatting";
import type { MemoryView } from "../backend";

declare global {
  interface Window {
    JSZip: new () => JSZip;
  }
}

interface JSZip {
  file(name: string, data: Uint8Array | string): void;
  generateAsync(options: { type: "blob" }): Promise<Blob>;
}

interface ExportDataButtonProps {
  familyId: bigint;
}

function getExtension(mediaType: string): string {
  if (mediaType === "video") return ".mp4";
  return ".jpg";
}

interface ManifestMemory {
  id: string;
  date: string;
  caption: string | null;
  taggedMembers: string[];
  mediaFiles: string[];
  createdAt: string;
}

export function ExportDataButton({ familyId }: ExportDataButtonProps) {
  const { actor } = useActor();
  const { data: dependents, isError: isDependentsError } =
    useFamilyDependents(familyId);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const handleExport = async () => {
    if (!actor || !dependents) return;

    setIsExporting(true);
    setProgress(0);
    setStatusText("Fetching memories...");
    const toastId = toast.loading("Preparing export...");

    try {
      const allMemories: MemoryView[] = [];
      let cursor: bigint | null = null;
      const pageSize = 50n;

      // Fetch all memories via pagination
      while (true) {
        const page = await actor.getRecentMemories(
          familyId,
          cursor,
          pageSize,
          null,
        );
        allMemories.push(...page.memories);
        if (!page.hasMore || page.nextCursor == null) break;
        cursor = page.nextCursor;
      }

      if (allMemories.length === 0) {
        toast.info("No memories to export", { id: toastId });
        setIsExporting(false);
        return;
      }

      setStatusText(`Processing ${allMemories.length} memories...`);

      // Build member name map
      const memberNames = new Map<string, string>();
      dependents.forEach((d) => memberNames.set(d.id.toString(), d.name));

      const zip = new window.JSZip();
      const manifest: ManifestMemory[] = [];
      let filesProcessed = 0;
      const totalMedia = allMemories.reduce(
        (sum, m) => sum + m.mediaBlobs.length,
        0,
      );
      const totalSteps = totalMedia + 1; // +1 for zip generation

      for (const memory of allMemories) {
        const dateFolder = memory.date; // YYYY-MM-DD
        const mediaFiles: string[] = [];

        for (let i = 0; i < memory.mediaBlobs.length; i++) {
          const blob = memory.mediaBlobs[i];
          const ext = getExtension(memory.mediaTypes[i]);
          const fileName = `${dateFolder}/memory-${memory.id}-${i + 1}${ext}`;

          setStatusText(`Downloading ${filesProcessed + 1}/${totalMedia}...`);

          try {
            const bytes = await blob.getBytes();
            zip.file(fileName, bytes);
            mediaFiles.push(fileName);
          } catch {
            console.error(`Failed to download media for memory ${memory.id}`);
          }

          filesProcessed++;
          setProgress(Math.round((filesProcessed / totalSteps) * 100));
        }

        manifest.push({
          id: memory.id.toString(),
          date: memory.date,
          caption: memory.caption ?? null,
          taggedMembers: memory.taggedMemberIds.map(
            (id) => memberNames.get(id.toString()) ?? `Member ${id}`,
          ),
          mediaFiles,
          createdAt: format(
            fromNanoseconds(memory.createdAt),
            "yyyy-MM-dd HH:mm:ss",
          ),
        });
      }

      // Add manifest JSON
      setStatusText("Creating zip...");
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      setProgress(99);

      const content = await zip.generateAsync({ type: "blob" });

      // Trigger download
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `secure-export-${format(new Date(), "yyyy-MM-dd")}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      toast.success(`Exported ${allMemories.length} memories`, { id: toastId });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.", { id: toastId });
    } finally {
      setIsExporting(false);
      setProgress(0);
      setStatusText("");
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full"
        onClick={handleExport}
        disabled={isExporting || !actor || isDependentsError}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {isExporting ? "Exporting..." : "Export Data"}
      </Button>
      {isExporting && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {statusText}
          </p>
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { ExternalBlob, MemberKind } from "../backend";
import { useAppStore } from "../stores/useAppStore";
import {
  useCreateMemory,
  useUpdateMemory,
  useFamilyDependents,
} from "../hooks/useQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const MAX_PHOTO_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB
const MAX_CAPTION_LENGTH = 500;

export interface EditableMemory {
  id: bigint;
  date: string;
  caption: string | null;
  mediaBlobs: ExternalBlob[];
  mediaTypes: string[];
  taggedMemberIds: bigint[];
}

interface MediaItem {
  existingBlob?: ExternalBlob;
  file?: File;
  previewUrl: string;
  mediaType: "image" | "video";
  progress: number | null;
}

interface MemoryFormValues {
  date: string;
  caption: string;
}

export function CreateMemoryDialog({
  open,
  onOpenChange,
  memory,
  defaultDate,
  milestoneKey,
  milestoneMemberId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memory?: EditableMemory;
  defaultDate?: string;
  milestoneKey?: string;
  milestoneMemberId?: bigint;
}) {
  const activeFamilyId = useAppStore((s) => s.activeFamilyId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!memory;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<MemoryFormValues>({
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      caption: "",
    },
  });

  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>([]);
  const [taggedMemberIds, setTaggedMemberIds] = useState<Set<bigint>>(
    new Set(),
  );
  const [isUploading, setIsUploading] = useState(false);

  const caption = watch("caption");

  useEffect(() => {
    if (!open) return;
    if (memory) {
      reset({
        date: memory.date,
        caption: memory.caption ?? "",
      });
      setMediaFiles(
        memory.mediaBlobs.map((blob, i) => ({
          existingBlob: blob,
          previewUrl: blob.getDirectURL(),
          mediaType: (memory.mediaTypes[i] === "video" ? "video" : "image") as
            | "image"
            | "video",
          progress: null,
        })),
      );
      setTaggedMemberIds(new Set(memory.taggedMemberIds));
    } else {
      reset({
        date: defaultDate ?? format(new Date(), "yyyy-MM-dd"),
        caption: "",
      });
      setMediaFiles([]);
      setTaggedMemberIds(
        milestoneMemberId !== undefined
          ? new Set([milestoneMemberId])
          : new Set(),
      );
    }
  }, [open]);

  const { data: dependents, isError: isDependentsError } =
    useFamilyDependents(activeFamilyId);
  const { mutate: createMemory, isPending: isCreating } = useCreateMemory();
  const { mutate: updateMemory, isPending: isUpdating } = useUpdateMemory();

  const isLoading = isCreating || isUpdating || isUploading;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isLoading) return;
    if (!nextOpen) {
      mediaFiles.forEach((mf) => {
        if (mf.file) URL.revokeObjectURL(mf.previewUrl);
      });
    }
    onOpenChange(nextOpen);
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newMedia: MediaItem[] = [];
    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        setError("root", {
          message: `"${file.name}" is not a supported image or video file`,
        });
        continue;
      }

      if (isImage && file.size > MAX_PHOTO_SIZE) {
        setError("root", {
          message: `"${file.name}" exceeds the 20 MB photo limit`,
        });
        continue;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        setError("root", {
          message: `"${file.name}" exceeds the 100 MB video limit`,
        });
        continue;
      }

      newMedia.push({
        file,
        previewUrl: URL.createObjectURL(file),
        mediaType: isImage ? "image" : "video",
        progress: null,
      });
    }

    if (newMedia.length > 0) {
      setMediaFiles((prev) => [...prev, ...newMedia]);
      clearErrors("root");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles((prev) => {
      const removed = prev[index];
      if (removed.file) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const toggleMember = (id: bigint) => {
    setTaggedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const onSubmit = async (data: MemoryFormValues) => {
    clearErrors("root");

    if (activeFamilyId === null) return;

    const trimmedCaption = data.caption.trim();
    if (!trimmedCaption && mediaFiles.length === 0) {
      setError("root", {
        message: "Add a caption or at least one photo/video",
      });
      return;
    }

    if (!data.date) {
      setError("root", { message: "Date is required" });
      return;
    }

    const blobs: ExternalBlob[] = [];
    const types: string[] = [];

    for (const mf of mediaFiles) {
      if (mf.existingBlob) {
        blobs.push(mf.existingBlob);
        types.push(mf.mediaType);
      }
    }

    const hasNewFiles = mediaFiles.some((mf) => mf.file);
    if (hasNewFiles) {
      setIsUploading(true);
      for (let i = 0; i < mediaFiles.length; i++) {
        const mf = mediaFiles[i];
        if (!mf.file) continue;
        try {
          const buffer = await mf.file.arrayBuffer();
          const blob = ExternalBlob.fromBytes(new Uint8Array(buffer));
          blob.withUploadProgress((pct) => {
            setMediaFiles((prev) =>
              prev.map((item, idx) =>
                idx === i ? { ...item, progress: pct } : item,
              ),
            );
          });
          blobs.push(blob);
          types.push(mf.mediaType);
        } catch {
          setError("root", {
            message: `Failed to process "${mf.file.name}"`,
          });
          setIsUploading(false);
          return;
        }
      }
    }

    const mutationArgs = {
      familyId: activeFamilyId,
      date: data.date,
      caption: trimmedCaption || null,
      mediaBlobs: blobs,
      mediaTypes: types,
      taggedMemberIds: Array.from(taggedMemberIds),
      milestoneKey: milestoneKey ?? null,
      milestoneMemberId: milestoneMemberId ?? null,
    };

    const callbacks = {
      onSuccess: () => {
        toast.success(isEditMode ? "Memory updated" : "Memory created");
        setIsUploading(false);
        handleOpenChange(false);
      },
      onError: (err: Error) => {
        setError("root", {
          message:
            err.message ||
            `Failed to ${isEditMode ? "update" : "create"} memory`,
        });
        setIsUploading(false);
      },
    };

    if (isEditMode && memory) {
      updateMemory({ ...mutationArgs, memoryId: memory.id }, callbacks);
    } else {
      createMemory(mutationArgs, callbacks);
    }
  };

  const allMembers = (dependents ?? []).map((dep) => ({
    id: dep.id,
    name: dep.name,
    type: dep.kind === MemberKind.child ? ("child" as const) : ("pet" as const),
  }));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Memory" : "New Memory"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update your memory."
              : "Add a memory with photos, captions, and tags."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memory-date">Date</Label>
            <Input
              {...register("date")}
              id="memory-date"
              type="date"
              disabled={isLoading}
            />
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label>Photos & Videos</Label>
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {mediaFiles.map((mf, index) => (
                  <div key={index} className="relative aspect-square">
                    {mf.mediaType === "video" ? (
                      <video
                        src={mf.previewUrl}
                        className="h-full w-full rounded-md object-cover"
                      />
                    ) : (
                      <img
                        src={mf.previewUrl}
                        alt={`Upload ${index + 1}`}
                        className="h-full w-full rounded-md object-cover"
                      />
                    )}
                    {!isLoading && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveMedia(index)}
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full [&_svg]:size-3"
                      >
                        <X />
                      </Button>
                    )}
                    {mf.progress !== null && (
                      <div className="absolute inset-x-0 bottom-0 p-1">
                        <Progress value={mf.progress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <ImagePlus className="h-4 w-4" />
              Add Media
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="memory-caption">Caption</Label>
              <span className="text-xs text-muted-foreground">
                {caption.length}/{MAX_CAPTION_LENGTH}
              </span>
            </div>
            <Textarea
              {...register("caption")}
              id="memory-caption"
              placeholder="What happened today?"
              maxLength={MAX_CAPTION_LENGTH}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Tag Members */}
          {allMembers.length > 0 && (
            <div className="space-y-2">
              <Label>Tag Family Members</Label>
              <div className="flex flex-wrap gap-3">
                {allMembers.map((member) => (
                  <label
                    key={`${member.type}-${member.id}`}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={taggedMemberIds.has(member.id)}
                      onCheckedChange={() => toggleMember(member.id)}
                      disabled={isLoading}
                    />
                    {member.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {isDependentsError && (
            <p className="text-sm text-destructive">
              Failed to load family members.
            </p>
          )}
          {errors.root && (
            <p className="text-sm text-destructive">{errors.root.message}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading
                ? "Saving..."
                : isEditMode
                  ? "Update Memory"
                  : "Save Memory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

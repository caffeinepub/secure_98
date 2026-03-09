import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalBlob } from "../backend";
import { useSetProfile } from "../hooks/useQueries";
import { MAX_PROFILE_NAME } from "../utils/constants";

const MAX_PHOTO_SIZE = 20 * 1024 * 1024; // 20 MB

interface ProfileSetupDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultName?: string;
  defaultPhotoUrl?: string | null;
  defaultPhotoBlob?: ExternalBlob | null;
}

export function ProfileSetupDialog({
  open,
  onOpenChange,
  defaultName,
  defaultPhotoUrl,
  defaultPhotoBlob,
}: ProfileSetupDialogProps) {
  const isEditMode = !!onOpenChange;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(defaultName ?? "");
  const [photoBlob, setPhotoBlob] = useState<ExternalBlob | null>(
    defaultPhotoBlob ?? null,
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    defaultPhotoUrl ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const { mutate: setProfile, isPending } = useSetProfile();

  useEffect(() => {
    if (open) {
      setName(defaultName ?? "");
      setPhotoBlob(defaultPhotoBlob ?? null);
      setPhotoPreview(defaultPhotoUrl ?? null);
      setError(null);
    }
  }, [open, defaultName, defaultPhotoUrl, defaultPhotoBlob]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PHOTO_SIZE) {
      setError("Photo must be 20 MB or smaller");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setError(null);
    setPhotoPreview(URL.createObjectURL(file));
    file.arrayBuffer().then((buffer) => {
      setPhotoBlob(ExternalBlob.fromBytes(new Uint8Array(buffer)));
    });
  };

  const handleRemovePhoto = () => {
    setPhotoBlob(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setProfile(
      { name: name.trim(), photoBlob },
      {
        onSuccess: () => {
          onOpenChange?.(false);
        },
        onError: (err: unknown) => {
          setError(
            err instanceof Error ? err.message : "Failed to save profile",
          );
        },
      },
    );
  };

  const initials = name.trim() ? name.trim().charAt(0).toUpperCase() : "";

  return (
    <Dialog open={open} onOpenChange={isEditMode ? onOpenChange : undefined}>
      <DialogContent showCloseButton={isEditMode} className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Profile" : "Welcome to Secure!"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update your name and profile photo."
                : "Let's set up your profile. Add a photo and enter your name."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar
                  className="h-20 w-20 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreview ? (
                    <AvatarImage
                      src={photoPreview}
                      alt="Profile photo"
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback>
                    {initials || (
                      <Camera className="h-6 w-6 text-muted-foreground" />
                    )}
                  </AvatarFallback>
                </Avatar>
                {photoPreview && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemovePhoto}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full [&_svg]:size-3"
                  >
                    <X />
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                maxLength={MAX_PROFILE_NAME}
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim() || isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Saving..." : isEditMode ? "Save" : "Get Started"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

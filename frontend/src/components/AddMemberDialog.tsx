import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { isValid, parseISO } from "date-fns";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { ExternalBlob, MemberKind, PetSex } from "../backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAddDependent, useUpdateDependent } from "../hooks/useQueries";
import {
  MAX_MEMBER_NAME,
  PET_TYPES,
  PET_SEX_OPTIONS,
} from "../utils/constants";

export type MemberType = "child" | "pet";

export interface EditData {
  id: bigint;
  kind: MemberKind;
  name: string;
  dateOfBirth: string | null;
  petType: string | null;
  breed: string | null;
  sex: PetSex | null;
  adoptionDate: string | null;
  photoBlob: ExternalBlob | null;
}

const MAX_PHOTO_SIZE = 20 * 1024 * 1024; // 20 MB

interface MemberFormValues {
  name: string;
  dateOfBirth: string;
  breed: string;
}

const defaultValues: MemberFormValues = {
  name: "",
  dateOfBirth: "",
  breed: "",
};

export function AddMemberDialog({
  open,
  onOpenChange,
  familyId,
  type,
  editData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyId: bigint;
  type: MemberType;
  editData?: EditData;
}) {
  const isEditing = !!editData;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<MemberFormValues>({ defaultValues });

  const [photoBlob, setPhotoBlob] = useState<ExternalBlob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [petType, setPetType] = useState<string>("");
  const [sex, setSex] = useState<string>("");
  const [adoptionDate, setAdoptionDate] = useState<string>("");

  const { mutate: addDependent, isPending: isAdding } = useAddDependent();
  const { mutate: updateDependent, isPending: isUpdating } =
    useUpdateDependent();
  const isPending = isAdding || isUpdating;

  useEffect(() => {
    if (!open) return;
    if (editData) {
      reset({
        name: editData.name,
        dateOfBirth: editData.dateOfBirth ?? "",
        breed: editData.breed ?? "",
      });
      setPhotoBlob(editData.photoBlob ?? null);
      setPhotoPreview(editData.photoBlob?.getDirectURL() ?? null);
      setPetType(editData.petType ?? "");
      setSex(editData.sex ?? "");
      setAdoptionDate(editData.adoptionDate ?? "");
    } else {
      reset(defaultValues);
      setPhotoBlob(null);
      setPhotoPreview(null);
      setPetType("");
      setSex("");
      setAdoptionDate("");
    }
  }, [open, editData]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PHOTO_SIZE) {
      setError("root", { message: "Photo must be 20 MB or smaller" });
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("root", { message: "Please select an image file" });
      return;
    }

    clearErrors("root");
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

  const onSubmit = (data: MemberFormValues) => {
    clearErrors("root");
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      setError("root", { message: "Name is required" });
      return;
    }

    const successMessage = isEditing
      ? `${trimmedName} updated`
      : `${trimmedName} added`;

    const callbacks = {
      onSuccess: () => {
        toast.success(successMessage);
        onOpenChange(false);
      },
      onError: (err: Error) => {
        setError("root", {
          message:
            err.message || `Failed to ${isEditing ? "update" : "add"} ${type}`,
        });
      },
    };

    if (type === "child") {
      if (!data.dateOfBirth) {
        setError("root", { message: "Date of birth is required" });
        return;
      }
      if (!isValid(parseISO(data.dateOfBirth))) {
        setError("root", { message: "Please enter a valid date" });
        return;
      }
    } else {
      if (!petType) {
        setError("root", { message: "Pet type is required" });
        return;
      }
      if (data.dateOfBirth && !isValid(parseISO(data.dateOfBirth))) {
        setError("root", { message: "Please enter a valid date" });
        return;
      }
      if (adoptionDate && !isValid(parseISO(adoptionDate))) {
        setError("root", { message: "Please enter a valid adoption date" });
        return;
      }
    }

    const kind = type === "child" ? MemberKind.child : MemberKind.pet;
    const args = {
      familyId,
      name: trimmedName,
      dateOfBirth: data.dateOfBirth || null,
      petType: type === "pet" ? petType || null : null,
      breed: type === "pet" ? data.breed.trim() || null : null,
      sex: type === "pet" && sex ? (sex as PetSex) : null,
      adoptionDate: type === "pet" ? adoptionDate || null : null,
      photoBlob,
    };

    if (isEditing) {
      updateDependent({ ...args, dependentId: editData!.id }, callbacks);
    } else {
      addDependent({ ...args, kind }, callbacks);
    }
  };

  const title = isEditing
    ? `Edit ${type === "child" ? "Child" : "Pet"}`
    : `Add ${type === "child" ? "Child" : "Pet"}`;
  const description =
    type === "child"
      ? "Enter your child's name, date of birth, and optional photo."
      : "Enter your pet's details and optional photo.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Avatar
                className="h-20 w-20 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {photoPreview ? (
                  <AvatarImage
                    src={photoPreview}
                    alt="Photo"
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback>
                  <Camera className="h-6 w-6 text-muted-foreground" />
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

          <div className="space-y-2">
            <Label htmlFor="member-name">Name</Label>
            <Input
              {...register("name")}
              id="member-name"
              placeholder={type === "child" ? "Emma" : "Buddy"}
              maxLength={MAX_MEMBER_NAME}
              disabled={isPending}
              autoFocus
            />
          </div>

          {type === "pet" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={petType}
                    onValueChange={setPetType}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PET_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    {...register("breed")}
                    id="breed"
                    placeholder="Golden Retriever"
                    maxLength={50}
                    disabled={isPending}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Sex</Label>
                  <Select
                    value={sex}
                    onValueChange={setSex}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      {PET_SEX_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adoption-date">Adoption Date</Label>
                  <Input
                    id="adoption-date"
                    type="date"
                    value={adoptionDate}
                    onChange={(e) => setAdoptionDate(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="dob">
              Date of Birth{type === "pet" ? " (optional)" : ""}
            </Label>
            <Input
              {...register("dateOfBirth")}
              id="dob"
              type="date"
              disabled={isPending}
            />
          </div>

          {errors.root && (
            <p className="text-sm text-destructive">{errors.root.message}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                  ? "Save"
                  : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

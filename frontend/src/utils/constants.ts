import { PetSex, Relationship } from "../backend";

export const MAX_FAMILY_NAME = 20;
export const MAX_PROFILE_NAME = 50;
export const MAX_MEMBER_NAME = 20;

export const RELATIONSHIPS = [
  { value: Relationship.mother, label: "Mother" },
  { value: Relationship.father, label: "Father" },
  { value: Relationship.grandmother, label: "Grandmother" },
  { value: Relationship.grandfather, label: "Grandfather" },
  { value: Relationship.aunt, label: "Aunt" },
  { value: Relationship.uncle, label: "Uncle" },
  { value: Relationship.cousin, label: "Cousin" },
  { value: Relationship.friend, label: "Friend" },
  { value: Relationship.other, label: "Other" },
] as const;

export const PET_TYPES = [
  "Dog",
  "Cat",
  "Bird",
  "Fish",
  "Rabbit",
  "Hamster",
  "Reptile",
  "Other",
] as const;

export const PET_SEX_OPTIONS = [
  { value: PetSex.male, label: "Male" },
  { value: PetSex.female, label: "Female" },
  { value: PetSex.unknown_, label: "Unknown" },
] as const;

export const PET_SEX_LABELS: Record<string, string> = {
  [PetSex.male]: "Male",
  [PetSex.female]: "Female",
  [PetSex.unknown_]: "Unknown",
};

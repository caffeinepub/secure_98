import { MemberKind } from "../backend";

export interface PredefinedMilestone {
  key: string;
  name: string;
  category: string;
  ageRange: string | null;
}

export const CHILD_MILESTONES: PredefinedMilestone[] = [
  // Cognition
  {
    key: "child-cog-1",
    name: "Follows moving objects with eyes",
    category: "Cognition",
    ageRange: "0-3",
  },
  {
    key: "child-cog-2",
    name: "Explores objects by putting them in mouth",
    category: "Cognition",
    ageRange: "3-6",
  },
  {
    key: "child-cog-3",
    name: "Finds hidden objects",
    category: "Cognition",
    ageRange: "6-12",
  },
  {
    key: "child-cog-4",
    name: "Looks at correct picture when named",
    category: "Cognition",
    ageRange: "6-12",
  },
  {
    key: "child-cog-5",
    name: "Sorts shapes and colors",
    category: "Cognition",
    ageRange: "12-24",
  },
  {
    key: "child-cog-6",
    name: "Begins make-believe play",
    category: "Cognition",
    ageRange: "12-24",
  },
  {
    key: "child-cog-7",
    name: "Names colors and counts to 10",
    category: "Cognition",
    ageRange: "24-48",
  },
  {
    key: "child-cog-8",
    name: "Understands concept of time",
    category: "Cognition",
    ageRange: "48-72",
  },
  // Communication
  {
    key: "child-com-1",
    name: "Coos and makes gurgling sounds",
    category: "Communication",
    ageRange: "0-3",
  },
  {
    key: "child-com-2",
    name: "Begins to babble",
    category: "Communication",
    ageRange: "3-6",
  },
  {
    key: "child-com-3",
    name: "Responds to simple spoken requests",
    category: "Communication",
    ageRange: "6-12",
  },
  {
    key: "child-com-4",
    name: "Says first words",
    category: "Communication",
    ageRange: "6-12",
  },
  {
    key: "child-com-5",
    name: "Says several single words",
    category: "Communication",
    ageRange: "12-24",
  },
  {
    key: "child-com-6",
    name: "Says sentences with 2-4 words",
    category: "Communication",
    ageRange: "12-24",
  },
  {
    key: "child-com-7",
    name: "Speaks clearly enough for strangers to understand",
    category: "Communication",
    ageRange: "24-48",
  },
  {
    key: "child-com-8",
    name: "Tells stories using full sentences",
    category: "Communication",
    ageRange: "48-72",
  },
  // Fine Motor
  {
    key: "child-fm-1",
    name: "Opens and closes hands",
    category: "Fine Motor",
    ageRange: "0-3",
  },
  {
    key: "child-fm-2",
    name: "Reaches for and grasps objects",
    category: "Fine Motor",
    ageRange: "3-6",
  },
  {
    key: "child-fm-3",
    name: "Uses pincer grasp",
    category: "Fine Motor",
    ageRange: "6-12",
  },
  {
    key: "child-fm-4",
    name: "Begins to hold and play with small toys",
    category: "Fine Motor",
    ageRange: "6-12",
  },
  {
    key: "child-fm-5",
    name: "Scribbles with crayons",
    category: "Fine Motor",
    ageRange: "12-24",
  },
  {
    key: "child-fm-6",
    name: "Stacks 2-4 blocks",
    category: "Fine Motor",
    ageRange: "12-24",
  },
  {
    key: "child-fm-7",
    name: "Uses scissors",
    category: "Fine Motor",
    ageRange: "24-48",
  },
  {
    key: "child-fm-8",
    name: "Writes some letters and numbers",
    category: "Fine Motor",
    ageRange: "48-72",
  },
  // Gross Motor
  {
    key: "child-gm-1",
    name: "Raises head during tummy time",
    category: "Gross Motor",
    ageRange: "0-3",
  },
  {
    key: "child-gm-2",
    name: "Rolls over both ways",
    category: "Gross Motor",
    ageRange: "3-6",
  },
  {
    key: "child-gm-3",
    name: "Sits without support",
    category: "Gross Motor",
    ageRange: "6-12",
  },
  {
    key: "child-gm-4",
    name: "Pulls to stand",
    category: "Gross Motor",
    ageRange: "6-12",
  },
  {
    key: "child-gm-5",
    name: "Walks alone",
    category: "Gross Motor",
    ageRange: "12-24",
  },
  {
    key: "child-gm-6",
    name: "Begins to run",
    category: "Gross Motor",
    ageRange: "12-24",
  },
  {
    key: "child-gm-7",
    name: "Climbs well",
    category: "Gross Motor",
    ageRange: "24-48",
  },
  {
    key: "child-gm-8",
    name: "Hops and stands on one foot",
    category: "Gross Motor",
    ageRange: "48-72",
  },
  // Social
  {
    key: "child-soc-1",
    name: "First social smile",
    category: "Social",
    ageRange: "0-3",
  },
  {
    key: "child-soc-2",
    name: "Enjoys playing with others",
    category: "Social",
    ageRange: "3-6",
  },
  {
    key: "child-soc-3",
    name: "Responds to own name",
    category: "Social",
    ageRange: "6-12",
  },
  {
    key: "child-soc-4",
    name: "Shows anxiety around strangers",
    category: "Social",
    ageRange: "6-12",
  },
  {
    key: "child-soc-5",
    name: "Imitates behavior of others",
    category: "Social",
    ageRange: "12-24",
  },
  {
    key: "child-soc-6",
    name: "Shows growing independence",
    category: "Social",
    ageRange: "12-24",
  },
  {
    key: "child-soc-7",
    name: "Shows concern for a crying friend",
    category: "Social",
    ageRange: "24-48",
  },
  {
    key: "child-soc-8",
    name: "Wants to please friends",
    category: "Social",
    ageRange: "48-72",
  },
];

export const PET_MILESTONES: PredefinedMilestone[] = [
  // Training
  {
    key: "pet-trn-1",
    name: "Responds to name",
    category: "Training",
    ageRange: null,
  },
  {
    key: "pet-trn-2",
    name: "Learns to sit",
    category: "Training",
    ageRange: null,
  },
  {
    key: "pet-trn-3",
    name: "Learns to stay",
    category: "Training",
    ageRange: null,
  },
  {
    key: "pet-trn-4",
    name: "Walks on leash",
    category: "Training",
    ageRange: null,
  },
  {
    key: "pet-trn-5",
    name: "House trained",
    category: "Training",
    ageRange: null,
  },
  // Firsts
  { key: "pet-fst-1", name: "First bath", category: "Firsts", ageRange: null },
  {
    key: "pet-fst-2",
    name: "First car ride",
    category: "Firsts",
    ageRange: null,
  },
  {
    key: "pet-fst-3",
    name: "First visit to the vet",
    category: "Firsts",
    ageRange: null,
  },
  {
    key: "pet-fst-4",
    name: "First night at home",
    category: "Firsts",
    ageRange: null,
  },
  {
    key: "pet-fst-5",
    name: "First time at a park",
    category: "Firsts",
    ageRange: null,
  },
  // Health
  {
    key: "pet-hlt-1",
    name: "First vaccination",
    category: "Health",
    ageRange: null,
  },
  {
    key: "pet-hlt-2",
    name: "Spayed or neutered",
    category: "Health",
    ageRange: null,
  },
  {
    key: "pet-hlt-3",
    name: "First dental cleaning",
    category: "Health",
    ageRange: null,
  },
  {
    key: "pet-hlt-4",
    name: "Microchipped",
    category: "Health",
    ageRange: null,
  },
  {
    key: "pet-hlt-5",
    name: "First grooming session",
    category: "Health",
    ageRange: null,
  },
];

export function getPredefinedMilestones(
  kind: MemberKind,
): PredefinedMilestone[] {
  return kind === MemberKind.child ? CHILD_MILESTONES : PET_MILESTONES;
}

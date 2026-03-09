import {
  useMutation,
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Principal } from "@icp-sdk/core/principal";
import { ExternalBlob, MemberKind, PetSex, Relationship } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["profile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.getProfile();
      return result ?? null;
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSetProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({
      name,
      photoBlob = null,
    }: {
      name: string;
      photoBlob?: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.setProfile(name, photoBlob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile", identity?.getPrincipal().toString()],
      });
    },
  });
}

export function useUserFamilies() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["userFamilies", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.getUserFamilies();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreateFamily() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.createFamily(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userFamilies", identity?.getPrincipal().toString()],
      });
    },
  });
}

export function useFamilyDependents(familyId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["familyDependents", familyId?.toString()],
    queryFn: async () => {
      if (!actor || familyId === null) throw new Error("Not ready");
      return await actor.getFamilyDependents(familyId);
    },
    enabled: !!actor && !isFetching && familyId !== null,
  });
}

export function useAddDependent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      kind,
      name,
      dateOfBirth,
      petType,
      breed,
      sex,
      adoptionDate,
      photoBlob,
    }: {
      familyId: bigint;
      kind: MemberKind;
      name: string;
      dateOfBirth: string | null;
      petType: string | null;
      breed: string | null;
      sex: PetSex | null;
      adoptionDate: string | null;
      photoBlob: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.addDependent(
        familyId,
        kind,
        name,
        dateOfBirth,
        petType,
        breed,
        sex,
        adoptionDate,
        photoBlob,
      );
    },
    onSuccess: (_, { familyId }) => {
      queryClient.invalidateQueries({
        queryKey: ["familyDependents", familyId.toString()],
      });
    },
  });
}

export function useUpdateDependent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      dependentId,
      name,
      dateOfBirth,
      petType,
      breed,
      sex,
      adoptionDate,
      photoBlob,
    }: {
      familyId: bigint;
      dependentId: bigint;
      name: string;
      dateOfBirth: string | null;
      petType: string | null;
      breed: string | null;
      sex: PetSex | null;
      adoptionDate: string | null;
      photoBlob: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.updateDependent(
        familyId,
        dependentId,
        name,
        dateOfBirth,
        petType,
        breed,
        sex,
        adoptionDate,
        photoBlob,
      );
    },
    onSuccess: (_, { familyId }) => {
      queryClient.invalidateQueries({
        queryKey: ["familyDependents", familyId.toString()],
      });
    },
  });
}

export function useRemoveDependent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      dependentId,
    }: {
      familyId: bigint;
      dependentId: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.removeDependent(familyId, dependentId);
    },
    onSuccess: (_, { familyId }) => {
      queryClient.invalidateQueries({
        queryKey: ["familyDependents", familyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["memories"],
        predicate: (q) => q.queryKey.includes(familyId.toString()),
      });
      queryClient.invalidateQueries({
        queryKey: ["monthSummary", familyId.toString()],
      });
    },
  });
}

export function useMonthSummary(
  familyId: bigint | null,
  year: number,
  month: number,
  memberId: bigint | null,
) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: [
      "monthSummary",
      familyId?.toString(),
      year,
      month,
      memberId?.toString() ?? null,
    ],
    queryFn: async () => {
      if (!actor || familyId === null) throw new Error("Not ready");
      return await actor.getMonthSummary(
        familyId,
        BigInt(year),
        BigInt(month),
        memberId,
      );
    },
    enabled: !!actor && !isFetching && familyId !== null,
  });
}

export function useMemoriesByDate(
  familyId: bigint | null,
  date: string | null,
) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["memories", familyId?.toString(), date],
    queryFn: async () => {
      if (!actor || familyId === null || !date) throw new Error("Not ready");
      return await actor.getMemoriesByDate(familyId, date);
    },
    enabled: !!actor && !isFetching && familyId !== null && !!date,
  });
}

export function useCreateMemory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      date,
      caption,
      mediaBlobs,
      mediaTypes,
      taggedMemberIds,
      milestoneKey = null,
      milestoneMemberId = null,
    }: {
      familyId: bigint;
      date: string;
      caption: string | null;
      mediaBlobs: ExternalBlob[];
      mediaTypes: string[];
      taggedMemberIds: bigint[];
      milestoneKey?: string | null;
      milestoneMemberId?: bigint | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.createMemory(
        familyId,
        date,
        caption,
        mediaBlobs,
        mediaTypes,
        taggedMemberIds,
        milestoneKey,
        milestoneMemberId,
      );
    },
    onSuccess: (_, { familyId, date }) => {
      queryClient.invalidateQueries({
        queryKey: ["memories", familyId.toString(), date],
      });
      queryClient.invalidateQueries({
        queryKey: ["monthSummary", familyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["recentMemories", familyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["mediaMemories", familyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["memoriesForMilestone", familyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["achievedMilestoneKeys", familyId.toString()],
      });
    },
  });
}

export function useUpdateMemory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      memoryId,
      date,
      caption,
      mediaBlobs,
      mediaTypes,
      taggedMemberIds,
      milestoneKey = null,
      milestoneMemberId = null,
    }: {
      familyId: bigint;
      memoryId: bigint;
      date: string;
      caption: string | null;
      mediaBlobs: ExternalBlob[];
      mediaTypes: string[];
      taggedMemberIds: bigint[];
      milestoneKey?: string | null;
      milestoneMemberId?: bigint | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.updateMemory(
        familyId,
        memoryId,
        date,
        caption,
        mediaBlobs,
        mediaTypes,
        taggedMemberIds,
        milestoneKey,
        milestoneMemberId,
      );
    },
    onSuccess: (_, { familyId }) => {
      queryClient.invalidateQueries({
        queryKey: ["memories", familyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["monthSummary", familyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["recentMemories", familyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["mediaMemories", familyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["memoriesForMilestone", familyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["achievedMilestoneKeys", familyId.toString()],
      });
    },
  });
}

export function useRedeemInviteCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({
      code,
      relationship,
    }: {
      code: string;
      relationship: Relationship;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.redeemInviteCode(code, relationship);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userFamilies", identity?.getPrincipal().toString()],
      });
    },
  });
}

export function useDeleteMemory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      memoryId,
    }: {
      familyId: bigint;
      memoryId: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.deleteMemory(familyId, memoryId);
    },
    onSuccess: (_, { familyId }) => {
      queryClient.invalidateQueries({
        queryKey: ["memories", familyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["monthSummary", familyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["recentMemories", familyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["mediaMemories", familyId.toString()],
      });
    },
  });
}

export function useFamilyMembers(familyId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["familyMembers", familyId?.toString()],
    queryFn: async () => {
      if (!actor || familyId === null) throw new Error("Not ready");
      return await actor.getFamilyMembers(familyId);
    },
    enabled: !!actor && !isFetching && familyId !== null,
  });
}

export function useGenerateInviteCode() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ familyId }: { familyId: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.generateInviteCode(familyId);
    },
  });
}

export function useUpdateMemberPermissions() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      member,
      permissions,
    }: {
      familyId: bigint;
      member: string;
      permissions: {
        canAddMemories: boolean;
        canAddMeasurementsAndMilestones: boolean;
        canViewMeasurementsAndMilestones: boolean;
      };
    }) => {
      if (!actor) throw new Error("Actor not ready");

      await actor.updateMemberPermissions(
        familyId,
        Principal.fromText(member),
        permissions,
      );
    },
    onSuccess: (_, { familyId }) => {
      queryClient.invalidateQueries({
        queryKey: ["familyMembers", familyId.toString()],
      });
    },
  });
}

export function useUpdateMemberRelationship() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      member,
      relationship,
    }: {
      familyId: bigint;
      member: string;
      relationship: Relationship;
    }) => {
      if (!actor) throw new Error("Actor not ready");

      await actor.updateMemberRelationship(
        familyId,
        Principal.fromText(member),
        relationship,
      );
    },
    onSuccess: (_, { familyId }) => {
      queryClient.invalidateQueries({
        queryKey: ["familyMembers", familyId.toString()],
      });
    },
  });
}

export function useMyPermissions(familyId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["myPermissions", familyId?.toString()],
    queryFn: async () => {
      if (!actor || familyId === null) throw new Error("Not ready");
      return await actor.getMyPermissions(familyId);
    },
    enabled: !!actor && !isFetching && familyId !== null,
  });
}

const DEFAULT_PAGE_SIZE = 20n;

export function useRecentMemories(
  familyId: bigint | null,
  memberId: bigint | null,
) {
  const { actor, isFetching } = useActor();

  return useInfiniteQuery({
    queryKey: [
      "recentMemories",
      familyId?.toString(),
      memberId?.toString() ?? null,
    ],
    queryFn: async ({ pageParam }) => {
      if (!actor || familyId === null) throw new Error("Not ready");
      return actor.getRecentMemories(
        familyId,
        pageParam,
        DEFAULT_PAGE_SIZE,
        memberId,
      );
    },
    initialPageParam: null as bigint | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!actor && !isFetching && familyId !== null,
  });
}

export function useMediaMemories(
  familyId: bigint | null,
  memberId: bigint | null,
) {
  const { actor, isFetching } = useActor();

  return useInfiniteQuery({
    queryKey: [
      "mediaMemories",
      familyId?.toString(),
      memberId?.toString() ?? null,
    ],
    queryFn: async ({ pageParam }) => {
      if (!actor || familyId === null) throw new Error("Not ready");
      return actor.getMediaMemories(
        familyId,
        pageParam,
        DEFAULT_PAGE_SIZE,
        memberId,
      );
    },
    initialPageParam: null as bigint | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!actor && !isFetching && familyId !== null,
  });
}

export function useCustomMilestones(
  familyId: bigint | null,
  memberId: bigint | null,
) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["customMilestones", familyId?.toString(), memberId?.toString()],
    queryFn: async () => {
      if (!actor || familyId === null || memberId === null)
        throw new Error("Not ready");
      return await actor.getCustomMilestones(familyId, memberId);
    },
    enabled: !!actor && !isFetching && familyId !== null && memberId !== null,
  });
}

export function useMemberMomentCount(
  familyId: bigint | null,
  memberId: bigint | null,
) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["memberMomentCount", familyId?.toString(), memberId?.toString()],
    queryFn: async () => {
      if (!actor || familyId === null || memberId === null)
        throw new Error("Not ready");
      return await actor.getMemberMomentCount(familyId, memberId);
    },
    enabled: !!actor && !isFetching && familyId !== null && memberId !== null,
  });
}

export function useRemoveFamilyMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      member,
    }: {
      familyId: bigint;
      member: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");

      await actor.removeFamilyMember(familyId, Principal.fromText(member));
    },
    onSuccess: (_, { familyId }) => {
      queryClient.invalidateQueries({
        queryKey: ["familyMembers", familyId.toString()],
      });
    },
  });
}

export function useCreateCustomMilestone() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      memberId,
      name,
      category,
    }: {
      familyId: bigint;
      memberId: bigint;
      name: string;
      category: string | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.createCustomMilestone(
        familyId,
        memberId,
        name,
        category,
      );
    },
    onSuccess: (_, { familyId, memberId }) => {
      queryClient.invalidateQueries({
        queryKey: [
          "customMilestones",
          familyId.toString(),
          memberId.toString(),
        ],
      });
    },
  });
}

export function useDeleteCustomMilestone() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      memberId,
      milestoneKey,
    }: {
      familyId: bigint;
      memberId: bigint;
      milestoneKey: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.deleteCustomMilestone(familyId, memberId, milestoneKey);
    },
    onSuccess: (_, { familyId, memberId }) => {
      queryClient.invalidateQueries({
        queryKey: [
          "customMilestones",
          familyId.toString(),
          memberId.toString(),
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "achievedMilestoneKeys",
          familyId.toString(),
          memberId.toString(),
        ],
      });
    },
  });
}

export function useGrowthMeasurements(
  familyId: bigint | null,
  dependentId: bigint | null,
) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: [
      "growthMeasurements",
      familyId?.toString(),
      dependentId?.toString(),
    ],
    queryFn: async () => {
      if (!actor || familyId === null || dependentId === null)
        throw new Error("Not ready");
      return await actor.getGrowthMeasurements(familyId, dependentId);
    },
    enabled:
      !!actor && !isFetching && familyId !== null && dependentId !== null,
  });
}

export function useAddGrowthMeasurement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      dependentId,
      date,
      heightCm,
      weightKg,
    }: {
      familyId: bigint;
      dependentId: bigint;
      date: string;
      heightCm: number | null;
      weightKg: number | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.addGrowthMeasurement(
        familyId,
        dependentId,
        date,
        heightCm,
        weightKg,
      );
    },
    onSuccess: (_, { familyId, dependentId }) => {
      queryClient.invalidateQueries({
        queryKey: [
          "growthMeasurements",
          familyId.toString(),
          dependentId.toString(),
        ],
      });
    },
  });
}

export function useDeleteGrowthMeasurement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      measurementId,
    }: {
      familyId: bigint;
      measurementId: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.deleteGrowthMeasurement(familyId, measurementId);
    },
    onSuccess: (_, { familyId }) => {
      queryClient.invalidateQueries({
        queryKey: ["growthMeasurements", familyId.toString()],
      });
    },
  });
}

export function useMemoriesForMilestone(
  familyId: bigint | null,
  memberId: bigint | null,
  milestoneKey: string | null,
) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: [
      "memoriesForMilestone",
      familyId?.toString(),
      memberId?.toString(),
      milestoneKey,
    ],
    queryFn: async () => {
      if (!actor || familyId === null || memberId === null || !milestoneKey)
        throw new Error("Not ready");
      return await actor.getMemoriesForMilestone(
        familyId,
        memberId,
        milestoneKey,
      );
    },
    enabled:
      !!actor &&
      !isFetching &&
      familyId !== null &&
      memberId !== null &&
      !!milestoneKey,
  });
}

export function useAchievedMilestoneKeys(
  familyId: bigint | null,
  memberId: bigint | null,
) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: [
      "achievedMilestoneKeys",
      familyId?.toString(),
      memberId?.toString(),
    ],
    queryFn: async () => {
      if (!actor || familyId === null || memberId === null)
        throw new Error("Not ready");
      return await actor.getAchievedMilestoneKeys(familyId, memberId);
    },
    enabled: !!actor && !isFetching && familyId !== null && memberId !== null,
  });
}

export function useLikes(familyId: bigint | null, memoryId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["likes", familyId?.toString(), memoryId?.toString()],
    queryFn: async () => {
      if (!actor || familyId === null || memoryId === null)
        throw new Error("Not ready");
      return await actor.getLikes(familyId, memoryId);
    },
    enabled: !!actor && !isFetching && familyId !== null && memoryId !== null,
  });
}

export function useToggleLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      memoryId,
    }: {
      familyId: bigint;
      memoryId: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.toggleLike(familyId, memoryId);
    },
    onSuccess: (_, { familyId, memoryId }) => {
      queryClient.invalidateQueries({
        queryKey: ["likes", familyId.toString(), memoryId.toString()],
      });
    },
  });
}

export function useComments(familyId: bigint | null, memoryId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["comments", familyId?.toString(), memoryId?.toString()],
    queryFn: async () => {
      if (!actor || familyId === null || memoryId === null)
        throw new Error("Not ready");
      return await actor.getComments(familyId, memoryId);
    },
    enabled: !!actor && !isFetching && familyId !== null && memoryId !== null,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      memoryId,
      text,
    }: {
      familyId: bigint;
      memoryId: bigint;
      text: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.addComment(familyId, memoryId, text);
    },
    onSuccess: (_, { familyId, memoryId }) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", familyId.toString(), memoryId.toString()],
      });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      commentId,
      memoryId,
    }: {
      familyId: bigint;
      commentId: bigint;
      memoryId: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.deleteComment(familyId, commentId, memoryId);
    },
    onSuccess: (_, { familyId, memoryId }) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", familyId.toString(), memoryId.toString()],
      });
    },
  });
}

export function useFlashbacks(familyId: bigint | null, date: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["flashbacks", familyId?.toString(), date],
    queryFn: async () => {
      if (!actor || familyId === null || !date) throw new Error("Not ready");
      return await actor.getFlashbacks(familyId, date);
    },
    enabled: !!actor && !isFetching && familyId !== null && !!date,
  });
}

export function useSearchMemories(familyId: bigint | null, query: string) {
  const { actor, isFetching } = useActor();
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["searchMemories", familyId?.toString(), trimmed],
    queryFn: async () => {
      if (!actor || familyId === null || !trimmed) throw new Error("Not ready");
      return await actor.searchMemories(familyId, trimmed);
    },
    enabled: !!actor && !isFetching && familyId !== null && trimmed.length > 0,
  });
}

export function useDeleteFamily() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ familyId }: { familyId: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.deleteFamily(familyId);
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

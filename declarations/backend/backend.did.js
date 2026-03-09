export const idlFactory = ({ IDL }) => {
  const _CaffeineStorageCreateCertificateResult = IDL.Record({
    method: IDL.Text,
    blob_hash: IDL.Text,
  });
  const _CaffeineStorageRefillInformation = IDL.Record({
    proposed_top_up_amount: IDL.Opt(IDL.Nat),
  });
  const _CaffeineStorageRefillResult = IDL.Record({
    success: IDL.Opt(IDL.Bool),
    topped_up_amount: IDL.Opt(IDL.Nat),
  });
  const MemberKind = IDL.Variant({ pet: IDL.Null, child: IDL.Null });
  const PetSex = IDL.Variant({
    female: IDL.Null,
    male: IDL.Null,
    unknown: IDL.Null,
  });
  const ExternalBlob = IDL.Vec(IDL.Nat8);
  const CommentView = IDL.Record({
    id: IDL.Nat,
    createdAt: IDL.Int,
    text: IDL.Text,
    authorName: IDL.Text,
    author: IDL.Principal,
    memoryId: IDL.Nat,
    canDelete: IDL.Bool,
  });
  const CustomMilestone = IDL.Record({
    key: IDL.Text,
    memberId: IDL.Nat,
    name: IDL.Text,
    category: IDL.Text,
    familyId: IDL.Nat,
  });
  const Family = IDL.Record({
    id: IDL.Nat,
    owner: IDL.Principal,
    name: IDL.Text,
    createdAt: IDL.Int,
  });
  const Dependent = IDL.Record({
    id: IDL.Nat,
    sex: IDL.Opt(PetSex),
    photoBlob: IDL.Opt(ExternalBlob),
    dateOfBirth: IDL.Opt(IDL.Text),
    kind: MemberKind,
    name: IDL.Text,
    petType: IDL.Opt(IDL.Text),
    breed: IDL.Opt(IDL.Text),
    adoptionDate: IDL.Opt(IDL.Text),
    familyId: IDL.Nat,
  });
  const Permissions = IDL.Record({
    canAddMemories: IDL.Bool,
    canAddMeasurements: IDL.Bool,
    canViewMeasurements: IDL.Bool,
  });
  const Relationship = IDL.Variant({
    grandmother: IDL.Null,
    grandfather: IDL.Null,
    other: IDL.Null,
    aunt: IDL.Null,
    uncle: IDL.Null,
    friend: IDL.Null,
    mother: IDL.Null,
    cousin: IDL.Null,
    father: IDL.Null,
  });
  const FamilyMemberView = IDL.Record({
    permissions: Permissions,
    principal: IDL.Principal,
    relationship: Relationship,
    displayName: IDL.Text,
    joinedAt: IDL.Int,
    isOwner: IDL.Bool,
  });
  const MemoryView = IDL.Record({
    id: IDL.Nat,
    taggedMemberIds: IDL.Vec(IDL.Nat),
    date: IDL.Text,
    createdAt: IDL.Int,
    authorName: IDL.Text,
    author: IDL.Principal,
    mediaBlobs: IDL.Vec(ExternalBlob),
    caption: IDL.Opt(IDL.Text),
    milestoneKey: IDL.Opt(IDL.Text),
    isAuthor: IDL.Bool,
    milestoneMemberId: IDL.Opt(IDL.Nat),
    familyId: IDL.Nat,
    authorPhotoBlob: IDL.Opt(ExternalBlob),
    mediaTypes: IDL.Vec(IDL.Text),
  });
  const GrowthMeasurementView = IDL.Record({
    id: IDL.Nat,
    heightCm: IDL.Opt(IDL.Float64),
    date: IDL.Text,
    dependentId: IDL.Nat,
    recordedAt: IDL.Int,
    weightKg: IDL.Opt(IDL.Float64),
  });
  const LikeInfo = IDL.Record({ count: IDL.Nat, likedByMe: IDL.Bool });
  const PaginatedMemories = IDL.Record({
    hasMore: IDL.Bool,
    memories: IDL.Vec(MemoryView),
    nextCursor: IDL.Opt(IDL.Nat),
  });
  const DaySummary = IDL.Record({
    memoryCount: IDL.Nat,
    date: IDL.Text,
    previewCaption: IDL.Opt(IDL.Text),
    previewBlob: IDL.Opt(ExternalBlob),
  });
  const MyPermissions = IDL.Record({
    canAddMemories: IDL.Bool,
    canAddMeasurements: IDL.Bool,
    canViewMeasurements: IDL.Bool,
    isOwner: IDL.Bool,
  });
  const Profile = IDL.Record({
    photoBlob: IDL.Opt(ExternalBlob),
    name: IDL.Text,
  });
  return IDL.Service({
    _caffeineStorageBlobIsLive: IDL.Func(
      [IDL.Vec(IDL.Nat8)],
      [IDL.Bool],
      ["query"],
    ),
    _caffeineStorageBlobsToDelete: IDL.Func(
      [],
      [IDL.Vec(IDL.Vec(IDL.Nat8))],
      ["query"],
    ),
    _caffeineStorageConfirmBlobDeletion: IDL.Func(
      [IDL.Vec(IDL.Vec(IDL.Nat8))],
      [],
      [],
    ),
    _caffeineStorageCreateCertificate: IDL.Func(
      [IDL.Text],
      [_CaffeineStorageCreateCertificateResult],
      [],
    ),
    _caffeineStorageRefillCashier: IDL.Func(
      [IDL.Opt(_CaffeineStorageRefillInformation)],
      [_CaffeineStorageRefillResult],
      [],
    ),
    _caffeineStorageUpdateGatewayPrincipals: IDL.Func([], [], []),
    addComment: IDL.Func([IDL.Nat, IDL.Nat, IDL.Text], [IDL.Nat], []),
    addDependent: IDL.Func(
      [
        IDL.Nat,
        MemberKind,
        IDL.Text,
        IDL.Opt(IDL.Text),
        IDL.Opt(IDL.Text),
        IDL.Opt(IDL.Text),
        IDL.Opt(PetSex),
        IDL.Opt(IDL.Text),
        IDL.Opt(ExternalBlob),
      ],
      [IDL.Nat],
      [],
    ),
    addGrowthMeasurement: IDL.Func(
      [IDL.Nat, IDL.Nat, IDL.Text, IDL.Opt(IDL.Float64), IDL.Opt(IDL.Float64)],
      [IDL.Nat],
      [],
    ),
    createCustomMilestone: IDL.Func(
      [IDL.Nat, IDL.Nat, IDL.Text, IDL.Opt(IDL.Text)],
      [IDL.Text],
      [],
    ),
    createFamily: IDL.Func([IDL.Text], [IDL.Nat], []),
    createMemory: IDL.Func(
      [
        IDL.Nat,
        IDL.Text,
        IDL.Opt(IDL.Text),
        IDL.Vec(ExternalBlob),
        IDL.Vec(IDL.Text),
        IDL.Vec(IDL.Nat),
        IDL.Opt(IDL.Text),
        IDL.Opt(IDL.Nat),
      ],
      [IDL.Nat],
      [],
    ),
    deleteComment: IDL.Func([IDL.Nat, IDL.Nat, IDL.Nat], [], []),
    deleteCustomMilestone: IDL.Func([IDL.Nat, IDL.Nat, IDL.Text], [], []),
    deleteFamily: IDL.Func([IDL.Nat], [], []),
    deleteGrowthMeasurement: IDL.Func([IDL.Nat, IDL.Nat], [], []),
    deleteMemory: IDL.Func([IDL.Nat, IDL.Nat], [], []),
    generateInviteCode: IDL.Func([IDL.Nat], [IDL.Text], []),
    getAchievedMilestoneKeys: IDL.Func(
      [IDL.Nat, IDL.Nat],
      [IDL.Vec(IDL.Text)],
      ["query"],
    ),
    getComments: IDL.Func(
      [IDL.Nat, IDL.Nat],
      [IDL.Vec(CommentView)],
      ["query"],
    ),
    getCustomMilestones: IDL.Func(
      [IDL.Nat, IDL.Nat],
      [IDL.Vec(CustomMilestone)],
      ["query"],
    ),
    getFamily: IDL.Func([IDL.Nat], [IDL.Opt(Family)], ["query"]),
    getFamilyDependents: IDL.Func([IDL.Nat], [IDL.Vec(Dependent)], ["query"]),
    getFamilyMembers: IDL.Func(
      [IDL.Nat],
      [IDL.Vec(FamilyMemberView)],
      ["query"],
    ),
    getFlashbacks: IDL.Func(
      [IDL.Nat, IDL.Text],
      [IDL.Vec(MemoryView)],
      ["query"],
    ),
    getGrowthMeasurements: IDL.Func(
      [IDL.Nat, IDL.Nat],
      [IDL.Vec(GrowthMeasurementView)],
      ["query"],
    ),
    getLikes: IDL.Func([IDL.Nat, IDL.Nat], [LikeInfo], ["query"]),
    getMediaMemories: IDL.Func(
      [IDL.Nat, IDL.Opt(IDL.Nat), IDL.Nat, IDL.Opt(IDL.Nat)],
      [PaginatedMemories],
      ["query"],
    ),
    getMemberMomentCount: IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], ["query"]),
    getMemoriesByDate: IDL.Func(
      [IDL.Nat, IDL.Text],
      [IDL.Vec(MemoryView)],
      ["query"],
    ),
    getMemoriesForMilestone: IDL.Func(
      [IDL.Nat, IDL.Nat, IDL.Text],
      [IDL.Vec(MemoryView)],
      ["query"],
    ),
    getMemory: IDL.Func([IDL.Nat, IDL.Nat], [IDL.Opt(MemoryView)], ["query"]),
    getMonthSummary: IDL.Func(
      [IDL.Nat, IDL.Nat, IDL.Nat, IDL.Opt(IDL.Nat)],
      [IDL.Vec(DaySummary)],
      ["query"],
    ),
    getMyPermissions: IDL.Func([IDL.Nat], [MyPermissions], ["query"]),
    getProfile: IDL.Func([], [IDL.Opt(Profile)], ["query"]),
    getRecentMemories: IDL.Func(
      [IDL.Nat, IDL.Opt(IDL.Nat), IDL.Nat, IDL.Opt(IDL.Nat)],
      [PaginatedMemories],
      ["query"],
    ),
    getUserFamilies: IDL.Func([], [IDL.Vec(Family)], ["query"]),
    linkMemoryToMilestone: IDL.Func(
      [IDL.Nat, IDL.Nat, IDL.Text, IDL.Nat],
      [],
      [],
    ),
    redeemInviteCode: IDL.Func([IDL.Text, Relationship], [Family], []),
    removeDependent: IDL.Func([IDL.Nat, IDL.Nat], [], []),
    removeFamilyMember: IDL.Func([IDL.Nat, IDL.Principal], [], []),
    searchMemories: IDL.Func(
      [IDL.Nat, IDL.Text],
      [IDL.Vec(MemoryView)],
      ["query"],
    ),
    setProfile: IDL.Func([IDL.Text, IDL.Opt(ExternalBlob)], [], []),
    toggleLike: IDL.Func([IDL.Nat, IDL.Nat], [LikeInfo], []),
    unlinkMemoryFromMilestone: IDL.Func([IDL.Nat, IDL.Nat], [], []),
    updateDependent: IDL.Func(
      [
        IDL.Nat,
        IDL.Nat,
        IDL.Text,
        IDL.Opt(IDL.Text),
        IDL.Opt(IDL.Text),
        IDL.Opt(IDL.Text),
        IDL.Opt(PetSex),
        IDL.Opt(IDL.Text),
        IDL.Opt(ExternalBlob),
      ],
      [],
      [],
    ),
    updateMemberPermissions: IDL.Func(
      [IDL.Nat, IDL.Principal, Permissions],
      [],
      [],
    ),
    updateMemberRelationship: IDL.Func(
      [IDL.Nat, IDL.Principal, Relationship],
      [],
      [],
    ),
    updateMemory: IDL.Func(
      [
        IDL.Nat,
        IDL.Nat,
        IDL.Text,
        IDL.Opt(IDL.Text),
        IDL.Vec(ExternalBlob),
        IDL.Vec(IDL.Text),
        IDL.Vec(IDL.Nat),
        IDL.Opt(IDL.Text),
        IDL.Opt(IDL.Nat),
      ],
      [],
      [],
    ),
  });
};
export const init = ({ IDL }) => {
  return [];
};

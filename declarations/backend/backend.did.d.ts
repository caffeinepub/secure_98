import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";

export interface CommentView {
  id: bigint;
  createdAt: bigint;
  text: string;
  authorName: string;
  author: Principal;
  memoryId: bigint;
  canDelete: boolean;
}
export interface CustomMilestone {
  key: string;
  memberId: bigint;
  name: string;
  category: string;
  familyId: bigint;
}
export interface DaySummary {
  memoryCount: bigint;
  date: string;
  previewCaption: [] | [string];
  previewBlob: [] | [ExternalBlob];
}
export interface Dependent {
  id: bigint;
  sex: [] | [PetSex];
  photoBlob: [] | [ExternalBlob];
  dateOfBirth: [] | [string];
  kind: MemberKind;
  name: string;
  petType: [] | [string];
  breed: [] | [string];
  adoptionDate: [] | [string];
  familyId: bigint;
}
export type ExternalBlob = Uint8Array | number[];
export interface Family {
  id: bigint;
  owner: Principal;
  name: string;
  createdAt: bigint;
}
export interface FamilyMemberView {
  permissions: Permissions;
  principal: Principal;
  relationship: Relationship;
  displayName: string;
  joinedAt: bigint;
  isOwner: boolean;
}
export interface GrowthMeasurementView {
  id: bigint;
  heightCm: [] | [number];
  date: string;
  dependentId: bigint;
  recordedAt: bigint;
  weightKg: [] | [number];
}
export interface LikeInfo {
  count: bigint;
  likedByMe: boolean;
}
export type MemberKind = { pet: null } | { child: null };
export interface MemoryView {
  id: bigint;
  taggedMemberIds: Array<bigint>;
  date: string;
  createdAt: bigint;
  authorName: string;
  author: Principal;
  mediaBlobs: Array<ExternalBlob>;
  caption: [] | [string];
  milestoneKey: [] | [string];
  isAuthor: boolean;
  milestoneMemberId: [] | [bigint];
  familyId: bigint;
  authorPhotoBlob: [] | [ExternalBlob];
  mediaTypes: Array<string>;
}
export interface MyPermissions {
  canAddMemories: boolean;
  canAddMeasurements: boolean;
  canViewMeasurements: boolean;
  isOwner: boolean;
}
export interface PaginatedMemories {
  hasMore: boolean;
  memories: Array<MemoryView>;
  nextCursor: [] | [bigint];
}
export interface Permissions {
  canAddMemories: boolean;
  canAddMeasurements: boolean;
  canViewMeasurements: boolean;
}
export type PetSex = { female: null } | { male: null } | { unknown: null };
export interface Profile {
  photoBlob: [] | [ExternalBlob];
  name: string;
}
export type Relationship =
  | { grandmother: null }
  | { grandfather: null }
  | { other: null }
  | { aunt: null }
  | { uncle: null }
  | { friend: null }
  | { mother: null }
  | { cousin: null }
  | { father: null };
export interface _CaffeineStorageCreateCertificateResult {
  method: string;
  blob_hash: string;
}
export interface _CaffeineStorageRefillInformation {
  proposed_top_up_amount: [] | [bigint];
}
export interface _CaffeineStorageRefillResult {
  success: [] | [boolean];
  topped_up_amount: [] | [bigint];
}
export interface _SERVICE {
  _caffeineStorageBlobIsLive: ActorMethod<[Uint8Array | number[]], boolean>;
  _caffeineStorageBlobsToDelete: ActorMethod<[], Array<Uint8Array | number[]>>;
  _caffeineStorageConfirmBlobDeletion: ActorMethod<
    [Array<Uint8Array | number[]>],
    undefined
  >;
  _caffeineStorageCreateCertificate: ActorMethod<
    [string],
    _CaffeineStorageCreateCertificateResult
  >;
  _caffeineStorageRefillCashier: ActorMethod<
    [[] | [_CaffeineStorageRefillInformation]],
    _CaffeineStorageRefillResult
  >;
  _caffeineStorageUpdateGatewayPrincipals: ActorMethod<[], undefined>;
  addComment: ActorMethod<[bigint, bigint, string], bigint>;
  addDependent: ActorMethod<
    [
      bigint,
      MemberKind,
      string,
      [] | [string],
      [] | [string],
      [] | [string],
      [] | [PetSex],
      [] | [string],
      [] | [ExternalBlob],
    ],
    bigint
  >;
  addGrowthMeasurement: ActorMethod<
    [bigint, bigint, string, [] | [number], [] | [number]],
    bigint
  >;
  createCustomMilestone: ActorMethod<
    [bigint, bigint, string, [] | [string]],
    string
  >;
  createFamily: ActorMethod<[string], bigint>;
  createMemory: ActorMethod<
    [
      bigint,
      string,
      [] | [string],
      Array<ExternalBlob>,
      Array<string>,
      Array<bigint>,
      [] | [string],
      [] | [bigint],
    ],
    bigint
  >;
  deleteComment: ActorMethod<[bigint, bigint, bigint], undefined>;
  deleteCustomMilestone: ActorMethod<[bigint, bigint, string], undefined>;
  deleteFamily: ActorMethod<[bigint], undefined>;
  deleteGrowthMeasurement: ActorMethod<[bigint, bigint], undefined>;
  deleteMemory: ActorMethod<[bigint, bigint], undefined>;
  generateInviteCode: ActorMethod<[bigint], string>;
  getAchievedMilestoneKeys: ActorMethod<[bigint, bigint], Array<string>>;
  getComments: ActorMethod<[bigint, bigint], Array<CommentView>>;
  getCustomMilestones: ActorMethod<[bigint, bigint], Array<CustomMilestone>>;
  getFamily: ActorMethod<[bigint], [] | [Family]>;
  getFamilyDependents: ActorMethod<[bigint], Array<Dependent>>;
  getFamilyMembers: ActorMethod<[bigint], Array<FamilyMemberView>>;
  getFlashbacks: ActorMethod<[bigint, string], Array<MemoryView>>;
  getGrowthMeasurements: ActorMethod<
    [bigint, bigint],
    Array<GrowthMeasurementView>
  >;
  getLikes: ActorMethod<[bigint, bigint], LikeInfo>;
  getMediaMemories: ActorMethod<
    [bigint, [] | [bigint], bigint, [] | [bigint]],
    PaginatedMemories
  >;
  getMemberMomentCount: ActorMethod<[bigint, bigint], bigint>;
  getMemoriesByDate: ActorMethod<[bigint, string], Array<MemoryView>>;
  getMemoriesForMilestone: ActorMethod<
    [bigint, bigint, string],
    Array<MemoryView>
  >;
  getMemory: ActorMethod<[bigint, bigint], [] | [MemoryView]>;
  getMonthSummary: ActorMethod<
    [bigint, bigint, bigint, [] | [bigint]],
    Array<DaySummary>
  >;
  getMyPermissions: ActorMethod<[bigint], MyPermissions>;
  getProfile: ActorMethod<[], [] | [Profile]>;
  getRecentMemories: ActorMethod<
    [bigint, [] | [bigint], bigint, [] | [bigint]],
    PaginatedMemories
  >;
  getUserFamilies: ActorMethod<[], Array<Family>>;
  linkMemoryToMilestone: ActorMethod<
    [bigint, bigint, string, bigint],
    undefined
  >;
  redeemInviteCode: ActorMethod<[string, Relationship], Family>;
  removeDependent: ActorMethod<[bigint, bigint], undefined>;
  removeFamilyMember: ActorMethod<[bigint, Principal], undefined>;
  searchMemories: ActorMethod<[bigint, string], Array<MemoryView>>;
  setProfile: ActorMethod<[string, [] | [ExternalBlob]], undefined>;
  toggleLike: ActorMethod<[bigint, bigint], LikeInfo>;
  unlinkMemoryFromMilestone: ActorMethod<[bigint, bigint], undefined>;
  updateDependent: ActorMethod<
    [
      bigint,
      bigint,
      string,
      [] | [string],
      [] | [string],
      [] | [string],
      [] | [PetSex],
      [] | [string],
      [] | [ExternalBlob],
    ],
    undefined
  >;
  updateMemberPermissions: ActorMethod<
    [bigint, Principal, Permissions],
    undefined
  >;
  updateMemberRelationship: ActorMethod<
    [bigint, Principal, Relationship],
    undefined
  >;
  updateMemory: ActorMethod<
    [
      bigint,
      bigint,
      string,
      [] | [string],
      Array<ExternalBlob>,
      Array<string>,
      Array<bigint>,
      [] | [string],
      [] | [bigint],
    ],
    undefined
  >;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

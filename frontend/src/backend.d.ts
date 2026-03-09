import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface GrowthMeasurementView {
    id: bigint;
    heightCm?: number;
    date: string;
    dependentId: bigint;
    recordedAt: bigint;
    weightKg?: number;
}
export interface CustomMilestone {
    key: string;
    memberId: bigint;
    name: string;
    category: string;
    familyId: bigint;
}
export interface MyPermissions {
    canAddMemories: boolean;
    canViewMeasurementsAndMilestones: boolean;
    canAddMeasurementsAndMilestones: boolean;
    isOwner: boolean;
}
export interface Family {
    id: bigint;
    owner: Principal;
    name: string;
    createdAt: bigint;
}
export interface LikeInfo {
    count: bigint;
    likedByMe: boolean;
}
export interface FamilyMemberView {
    permissions: Permissions;
    principal: Principal;
    relationship: Relationship;
    displayName: string;
    joinedAt: bigint;
    isOwner: boolean;
}
export interface Profile {
    photoBlob?: ExternalBlob;
    name: string;
}
export interface Permissions {
    canAddMemories: boolean;
    canViewMeasurementsAndMilestones: boolean;
    canAddMeasurementsAndMilestones: boolean;
}
export interface Dependent {
    id: bigint;
    sex?: PetSex;
    photoBlob?: ExternalBlob;
    dateOfBirth?: string;
    kind: MemberKind;
    name: string;
    petType?: string;
    breed?: string;
    adoptionDate?: string;
    familyId: bigint;
}
export interface CommentView {
    id: bigint;
    createdAt: bigint;
    text: string;
    authorName: string;
    author: Principal;
    memoryId: bigint;
    canDelete: boolean;
}
export interface MemoryView {
    id: bigint;
    taggedMemberIds: Array<bigint>;
    date: string;
    createdAt: bigint;
    authorName: string;
    author: Principal;
    mediaBlobs: Array<ExternalBlob>;
    caption?: string;
    milestoneKey?: string;
    isAuthor: boolean;
    milestoneMemberId?: bigint;
    familyId: bigint;
    authorPhotoBlob?: ExternalBlob;
    mediaTypes: Array<string>;
}
export interface DaySummary {
    memoryCount: bigint;
    date: string;
    previewCaption?: string;
    previewBlob?: ExternalBlob;
}
export interface PaginatedMemories {
    hasMore: boolean;
    memories: Array<MemoryView>;
    nextCursor?: bigint;
}
export enum MemberKind {
    pet = "pet",
    child = "child"
}
export enum PetSex {
    female = "female",
    male = "male",
    unknown_ = "unknown"
}
export enum Relationship {
    grandmother = "grandmother",
    grandfather = "grandfather",
    other = "other",
    aunt = "aunt",
    uncle = "uncle",
    friend = "friend",
    mother = "mother",
    cousin = "cousin",
    father = "father"
}
export interface backendInterface {
    addComment(familyId: bigint, memoryId: bigint, text: string): Promise<bigint>;
    addDependent(familyId: bigint, kind: MemberKind, name: string, dateOfBirth: string | null, petType: string | null, breed: string | null, sex: PetSex | null, adoptionDate: string | null, photoBlob: ExternalBlob | null): Promise<bigint>;
    addGrowthMeasurement(familyId: bigint, dependentId: bigint, date: string, heightCm: number | null, weightKg: number | null): Promise<bigint>;
    createCustomMilestone(familyId: bigint, memberId: bigint, name: string, category: string | null): Promise<string>;
    createFamily(name: string): Promise<bigint>;
    createMemory(familyId: bigint, date: string, caption: string | null, mediaBlobs: Array<ExternalBlob>, mediaTypes: Array<string>, taggedMemberIds: Array<bigint>, milestoneKey: string | null, milestoneMemberId: bigint | null): Promise<bigint>;
    deleteComment(familyId: bigint, commentId: bigint, memoryId: bigint): Promise<void>;
    deleteCustomMilestone(familyId: bigint, memberId: bigint, milestoneKey: string): Promise<void>;
    deleteFamily(familyId: bigint): Promise<void>;
    deleteGrowthMeasurement(familyId: bigint, measurementId: bigint): Promise<void>;
    deleteMemory(familyId: bigint, memoryId: bigint): Promise<void>;
    generateInviteCode(familyId: bigint): Promise<string>;
    getAchievedMilestoneKeys(familyId: bigint, memberId: bigint): Promise<Array<string>>;
    getComments(familyId: bigint, memoryId: bigint): Promise<Array<CommentView>>;
    getCustomMilestones(familyId: bigint, memberId: bigint): Promise<Array<CustomMilestone>>;
    getFamily(familyId: bigint): Promise<Family | null>;
    getFamilyDependents(familyId: bigint): Promise<Array<Dependent>>;
    getFamilyMembers(familyId: bigint): Promise<Array<FamilyMemberView>>;
    getFlashbacks(familyId: bigint, date: string): Promise<Array<MemoryView>>;
    getGrowthMeasurements(familyId: bigint, dependentId: bigint): Promise<Array<GrowthMeasurementView>>;
    getLikes(familyId: bigint, memoryId: bigint): Promise<LikeInfo>;
    getMediaMemories(familyId: bigint, cursor: bigint | null, limit: bigint, memberId: bigint | null): Promise<PaginatedMemories>;
    getMemberMomentCount(familyId: bigint, memberId: bigint): Promise<bigint>;
    getMemoriesByDate(familyId: bigint, date: string): Promise<Array<MemoryView>>;
    getMemoriesForMilestone(familyId: bigint, memberId: bigint, milestoneKey: string): Promise<Array<MemoryView>>;
    getMonthSummary(familyId: bigint, year: bigint, month: bigint, memberId: bigint | null): Promise<Array<DaySummary>>;
    getMyPermissions(familyId: bigint): Promise<MyPermissions>;
    getProfile(): Promise<Profile | null>;
    getRecentMemories(familyId: bigint, cursor: bigint | null, limit: bigint, memberId: bigint | null): Promise<PaginatedMemories>;
    getUserFamilies(): Promise<Array<Family>>;
    redeemInviteCode(code: string, relationship: Relationship): Promise<Family>;
    removeDependent(familyId: bigint, dependentId: bigint): Promise<void>;
    removeFamilyMember(familyId: bigint, member: Principal): Promise<void>;
    searchMemories(familyId: bigint, searchText: string): Promise<Array<MemoryView>>;
    setProfile(name: string, photoBlob: ExternalBlob | null): Promise<void>;
    toggleLike(familyId: bigint, memoryId: bigint): Promise<LikeInfo>;
    updateDependent(familyId: bigint, dependentId: bigint, name: string, dateOfBirth: string | null, petType: string | null, breed: string | null, sex: PetSex | null, adoptionDate: string | null, photoBlob: ExternalBlob | null): Promise<void>;
    updateMemberPermissions(familyId: bigint, member: Principal, permissions: Permissions): Promise<void>;
    updateMemberRelationship(familyId: bigint, member: Principal, relationship: Relationship): Promise<void>;
    updateMemory(familyId: bigint, memoryId: bigint, date: string, caption: string | null, mediaBlobs: Array<ExternalBlob>, mediaTypes: Array<string>, taggedMemberIds: Array<bigint>, milestoneKey: string | null, milestoneMemberId: bigint | null): Promise<void>;
}

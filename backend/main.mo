import Char "mo:core/Char";
import Int "mo:core/Int";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type Profile = {
    name : Text;
    photoBlob : ?Storage.ExternalBlob;
  };

  type Family = {
    id : Nat;
    name : Text;
    owner : Principal;
    createdAt : Int;
  };

  type Relationship = {
    #mother;
    #father;
    #grandmother;
    #grandfather;
    #aunt;
    #uncle;
    #cousin;
    #friend;
    #other;
  };

  type Permissions = {
    canAddMemories : Bool;
    canAddMeasurementsAndMilestones : Bool;
    canViewMeasurementsAndMilestones : Bool;
  };

  type FamilyMember = {
    relationship : Relationship;
    permissions : Permissions;
    displayName : Text;
    joinedAt : Int;
  };

  type InviteCode = {
    code : Text;
    familyId : Nat;
    createdAt : Int;
  };

  type MemberKind = { #child; #pet };

  type PetSex = { #male; #female; #unknown };

  type Dependent = {
    id : Nat;
    familyId : Nat;
    kind : MemberKind;
    name : Text;
    dateOfBirth : ?Text;
    petType : ?Text;
    breed : ?Text;
    sex : ?PetSex;
    adoptionDate : ?Text;
    photoBlob : ?Storage.ExternalBlob;
  };

  type Memory = {
    id : Nat;
    familyId : Nat;
    date : Text;
    caption : ?Text;
    mediaBlobs : [Storage.ExternalBlob];
    mediaTypes : [Text];
    taggedMemberIds : [Nat];
    milestoneKey : ?Text;
    milestoneMemberId : ?Nat;
    author : Principal;
    createdAt : Int;
  };

  type MemoryView = {
    id : Nat;
    familyId : Nat;
    date : Text;
    caption : ?Text;
    mediaBlobs : [Storage.ExternalBlob];
    mediaTypes : [Text];
    taggedMemberIds : [Nat];
    milestoneKey : ?Text;
    milestoneMemberId : ?Nat;
    author : Principal;
    authorName : Text;
    authorPhotoBlob : ?Storage.ExternalBlob;
    createdAt : Int;
    isAuthor : Bool;
  };

  type FamilyMemberView = {
    principal : Principal;
    relationship : Relationship;
    permissions : Permissions;
    displayName : Text;
    joinedAt : Int;
    isOwner : Bool;
  };

  type MyPermissions = {
    isOwner : Bool;
    canAddMemories : Bool;
    canAddMeasurementsAndMilestones : Bool;
    canViewMeasurementsAndMilestones : Bool;
  };

  type DaySummary = {
    date : Text;
    memoryCount : Nat;
    previewBlob : ?Storage.ExternalBlob;
    previewCaption : ?Text;
  };

  type PaginatedMemories = {
    memories : [MemoryView];
    nextCursor : ?Nat;
    hasMore : Bool;
  };

  type CustomMilestone = {
    key : Text;
    memberId : Nat;
    familyId : Nat;
    name : Text;
    category : Text;
  };

  type GrowthMeasurement = {
    id : Nat;
    dependentId : Nat;
    familyId : Nat;
    date : Text;
    heightCm : ?Float;
    weightKg : ?Float;
    recordedAt : Int;
  };

  type GrowthMeasurementView = {
    id : Nat;
    dependentId : Nat;
    date : Text;
    heightCm : ?Float;
    weightKg : ?Float;
    recordedAt : Int;
  };

  type Comment = {
    id : Nat;
    memoryId : Nat;
    familyId : Nat;
    author : Principal;
    text : Text;
    createdAt : Int;
  };

  type CommentView = {
    id : Nat;
    memoryId : Nat;
    author : Principal;
    authorName : Text;
    text : Text;
    createdAt : Int;
    canDelete : Bool;
  };

  type LikeInfo = {
    count : Nat;
    likedByMe : Bool;
  };

  var userProfiles : Map.Map<Principal, Profile> = Map.empty();

  var families : Map.Map<Nat, Family> = Map.empty();
  var nextFamilyId : Nat = 0;

  var familyMembers : Map.Map<Nat, Map.Map<Principal, FamilyMember>> = Map.empty();
  var userOwnedFamily : Map.Map<Principal, Nat> = Map.empty();
  var userMemberships : Map.Map<Principal, List.List<Nat>> = Map.empty();

  var familyDependents : Map.Map<Nat, Map.Map<Nat, Dependent>> = Map.empty();
  var nextDependentId : Nat = 0;

  var familyMemories : Map.Map<Nat, Map.Map<Nat, Memory>> = Map.empty();
  var nextMemoryId : Nat = 0;

  var inviteCodes : Map.Map<Text, InviteCode> = Map.empty();
  var inviteCodeSeed : Nat = 0;

  var customMilestones : Map.Map<Nat, Map.Map<Text, CustomMilestone>> = Map.empty();
  var nextCustomMilestoneId : Nat = 0;

  var growthMeasurements : Map.Map<Nat, Map.Map<Nat, GrowthMeasurement>> = Map.empty();
  var nextGrowthId : Nat = 0;

  var memoryLikes : Map.Map<Nat, Map.Map<Principal, Bool>> = Map.empty();
  var memoryComments : Map.Map<Nat, Map.Map<Nat, Comment>> = Map.empty();
  var nextCommentId : Nat = 0;

  let MAX_FAMILY_NAME : Nat = 20;
  let MAX_PROFILE_NAME : Nat = 50;
  let MAX_MEMBER_NAME : Nat = 20;
  let MAX_FAMILIES_PER_USER : Nat = 5;
  let MAX_DEPENDENTS_PER_FAMILY : Nat = 100;
  let MAX_MEDIA_PER_MEMORY : Nat = 20;
  let MAX_SEARCH_TEXT : Nat = 200;
  let MAX_TYPE_BREED : Nat = 50;
  let MAX_MEMORIES_PER_FAMILY : Nat = 2000;
  let MAX_COMMENTS_PER_MEMORY : Nat = 1000;
  let MAX_GROWTH_PER_FAMILY : Nat = 1000;
  let MAX_CUSTOM_MILESTONES_PER_FAMILY : Nat = 500;
  let MAX_CATEGORY : Nat = 50;

  let codeChars : [Text] = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "2", "3", "4", "5", "6", "7", "8", "9"];

  // Helpers

  func requireAuth(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Not authenticated");
    };
  };

  func isOwner(caller : Principal, familyId : Nat) : Bool {
    switch (families.get(familyId)) {
      case (?family) { family.owner == caller };
      case (null) { false };
    };
  };

  func requireFamilyMember(caller : Principal, familyId : Nat) {
    switch (familyMembers.get(familyId)) {
      case (?members) {
        switch (members.get(caller)) {
          case (?_) {};
          case (null) { Runtime.trap("Not a member of this family") };
        };
      };
      case (null) { Runtime.trap("Not a member of this family") };
    };
  };

  func requireFamilyOwner(caller : Principal, familyId : Nat) {
    switch (families.get(familyId)) {
      case (?family) {
        if (family.owner != caller) {
          Runtime.trap("Only the family owner can perform this action");
        };
      };
      case (null) { Runtime.trap("Family not found") };
    };
  };

  func requirePermission(caller : Principal, familyId : Nat, check : (Permissions) -> Bool, msg : Text) {
    if (isOwner(caller, familyId)) { return };
    switch (familyMembers.get(familyId)) {
      case (?members) {
        switch (members.get(caller)) {
          case (?member) {
            if (not check(member.permissions)) { Runtime.trap(msg) };
          };
          case (null) { Runtime.trap("Not a member of this family") };
        };
      };
      case (null) { Runtime.trap("Not a member of this family") };
    };
  };

  func requireCanAddMemories(caller : Principal, familyId : Nat) {
    requirePermission(caller, familyId, func(p) { p.canAddMemories }, "You don't have permission to add memories");
  };
  func requireCanAddMeasurements(caller : Principal, familyId : Nat) {
    requirePermission(caller, familyId, func(p) { p.canAddMeasurementsAndMilestones }, "You don't have permission to add measurements");
  };
  func requireCanViewMeasurements(caller : Principal, familyId : Nat) {
    requirePermission(caller, familyId, func(p) { p.canViewMeasurementsAndMilestones }, "You don't have permission to view measurements");
  };

  // Verify a memory belongs to the specified family (prevents cross-family access)
  func requireMemoryInFamily(familyId : Nat, memoryId : Nat) {
    switch (familyMemories.get(familyId)) {
      case (?memories) {
        switch (memories.get(memoryId)) {
          case (?_) {};
          case (null) { Runtime.trap("Memory not found in this family") };
        };
      };
      case (null) { Runtime.trap("Memory not found in this family") };
    };
  };

  func requireUnderLimit(current : Nat, max : Nat, msg : Text) {
    if (current >= max) { Runtime.trap(msg) };
  };

  func validateName(name : Text, field : Text) {
    if (name == "") { Runtime.trap(field # " cannot be empty") };
    if (name.size() > MAX_MEMBER_NAME) {
      Runtime.trap(field # " must be " # MAX_MEMBER_NAME.toText() # " characters or fewer");
    };
  };

  func getOrCreateNat<V>(store : Map.Map<Nat, V>, key : Nat, dflt : V) : V {
    switch (store.get(key)) {
      case (?v) { v };
      case (null) {
        store.add(key, dflt);
        dflt;
      };
    };
  };

  func getOrCreatePrincipal<V>(store : Map.Map<Principal, V>, key : Principal, dflt : V) : V {
    switch (store.get(key)) {
      case (?v) { v };
      case (null) {
        store.add(key, dflt);
        dflt;
      };
    };
  };

  func getMemberMap(familyId : Nat) : Map.Map<Principal, FamilyMember> {
    getOrCreateNat(familyMembers, familyId, Map.empty<Principal, FamilyMember>());
  };
  func getDependentMap(familyId : Nat) : Map.Map<Nat, Dependent> {
    getOrCreateNat(familyDependents, familyId, Map.empty<Nat, Dependent>());
  };
  func getMembershipList(user : Principal) : List.List<Nat> {
    getOrCreatePrincipal(userMemberships, user, List.empty<Nat>());
  };
  func getMemoryMap(familyId : Nat) : Map.Map<Nat, Memory> {
    getOrCreateNat(familyMemories, familyId, Map.empty<Nat, Memory>());
  };
  func getCustomMilestoneMap(familyId : Nat) : Map.Map<Text, CustomMilestone> {
    getOrCreateNat(customMilestones, familyId, Map.empty<Text, CustomMilestone>());
  };
  func getGrowthMap(familyId : Nat) : Map.Map<Nat, GrowthMeasurement> {
    getOrCreateNat(growthMeasurements, familyId, Map.empty<Nat, GrowthMeasurement>());
  };
  func getLikeMap(memoryId : Nat) : Map.Map<Principal, Bool> {
    getOrCreateNat(memoryLikes, memoryId, Map.empty<Principal, Bool>());
  };
  func getCommentMap(memoryId : Nat) : Map.Map<Nat, Comment> {
    getOrCreateNat(memoryComments, memoryId, Map.empty<Nat, Comment>());
  };

  func isValidMediaType(t : Text) : Bool {
    t == "image" or t == "video";
  };

  func validateTaggedMemberIds(taggedMemberIds : [Nat], familyId : Nat) {
    let deps = getDependentMap(familyId);
    for (id in taggedMemberIds.vals()) {
      switch (deps.get(id)) {
        case (null) {
          Runtime.trap("Tagged member ID " # id.toText() # " is not a valid dependent");
        };
        case (_) {};
      };
    };
  };

  func validateMilestoneMemberId(milestoneMemberId : ?Nat, familyId : Nat) {
    switch (milestoneMemberId) {
      case (?mid) {
        switch (getDependentMap(familyId).get(mid)) {
          case (null) {
            Runtime.trap("Milestone member ID " # mid.toText() # " is not a valid dependent");
          };
          case (_) {};
        };
      };
      case (null) {};
    };
  };

  func cascadeDeleteMember(familyId : Nat, memberId : Nat) {
    // Delete memories tagged with this member or linked to milestone for this member
    switch (familyMemories.get(familyId)) {
      case (?memories) {
        let toRemove = List.empty<Nat>();
        for ((id, memory) in memories.entries()) {
          let tagged = arrayContains(memory.taggedMemberIds, memberId);
          let milestoneLinked = switch (memory.milestoneMemberId) {
            case (?mid) { mid == memberId };
            case (null) { false };
          };
          if (tagged or milestoneLinked) { toRemove.add(id) };
        };
        for (id in toRemove.values()) {
          memories.remove(id);
          memoryLikes.remove(id);
          memoryComments.remove(id);
        };
      };
      case (null) {};
    };
    // Delete custom milestones for this member
    switch (customMilestones.get(familyId)) {
      case (?milestones) {
        let toRemove = List.empty<Text>();
        for ((key, ms) in milestones.entries()) {
          if (ms.memberId == memberId) { toRemove.add(key) };
        };
        for (key in toRemove.values()) { milestones.remove(key) };
      };
      case (null) {};
    };
  };

  func getProfileName(user : Principal) : Text {
    switch (userProfiles.get(user)) {
      case (?profile) { profile.name };
      case (null) { "Unknown" };
    };
  };

  func getProfilePhoto(user : Principal) : ?Storage.ExternalBlob {
    switch (userProfiles.get(user)) {
      case (?profile) { profile.photoBlob };
      case (null) { null };
    };
  };

  func milestoneMapKey(memberId : Nat, milestoneKey : Text) : Text {
    memberId.toText() # "-" # milestoneKey;
  };

  func dateHasPrefix(date : Text, prefix : Text) : Bool {
    let dateChars = date.chars();
    for (pc in prefix.chars()) {
      switch (dateChars.next()) {
        case (?dc) {
          if (dc != pc) { return false };
        };
        case (null) { return false };
      };
    };
    true;
  };

  func arrayContains(arr : [Nat], value : Nat) : Bool {
    for (item in arr.vals()) {
      if (item == value) { return true };
    };
    false;
  };

  func toLower(t : Text) : Text {
    var result = "";
    for (c in t.chars()) {
      if (c >= 'A' and c <= 'Z') {
        result #= Char.fromNat32(c.toNat32() + 32).toText();
      } else {
        result #= c.toText();
      };
    };
    result;
  };

  func truncateText(t : Text, maxLen : Nat) : Text {
    if (t.size() <= maxLen) { return t };
    var result = "";
    var count = 0;
    for (c in t.chars()) {
      if (count >= maxLen) { return result };
      result #= c.toText();
      count += 1;
    };
    result;
  };

  func textContains(haystack : Text, needle : Text) : Bool {
    if (needle.size() == 0) { return true };
    if (needle.size() > haystack.size()) { return false };
    let hBuf = List.empty<Char>();
    for (c in haystack.chars()) { hBuf.add(c) };
    let nBuf = List.empty<Char>();
    for (c in needle.chars()) { nBuf.add(c) };
    let hArr = hBuf.toArray();
    let nArr = nBuf.toArray();
    let limit = hArr.size() - nArr.size();
    var i = 0;
    while (i <= limit) {
      var j = 0;
      var matched = true;
      while (j < nArr.size()) {
        if (hArr[i + j] != nArr[j]) {
          matched := false;
          j := nArr.size();
        } else {
          j += 1;
        };
      };
      if (matched) { return true };
      i += 1;
    };
    false;
  };

  func textContainsCI(haystack : Text, needle : Text) : Bool {
    textContains(toLower(haystack), toLower(needle));
  };

  func dateMonthDay(date : Text) : Text {
    var result = "";
    var i = 0;
    for (c in date.chars()) {
      if (i >= 4) { result #= c.toText() };
      i += 1;
    };
    result;
  };

  func generateCodeStr() : Text {
    var seed = Int.abs(Time.now()) + inviteCodeSeed * 1000003;
    inviteCodeSeed += 1;
    let len = codeChars.size();
    var code = "";
    var i = 0;
    while (i < 8) {
      code #= codeChars[seed % len];
      seed /= len;
      i += 1;
    };
    code;
  };

  func toMemoryView(memory : Memory, caller : Principal) : MemoryView {
    {
      id = memory.id;
      familyId = memory.familyId;
      date = memory.date;
      caption = memory.caption;
      mediaBlobs = memory.mediaBlobs;
      mediaTypes = memory.mediaTypes;
      taggedMemberIds = memory.taggedMemberIds;
      milestoneKey = memory.milestoneKey;
      milestoneMemberId = memory.milestoneMemberId;
      author = memory.author;
      authorName = getProfileName(memory.author);
      authorPhotoBlob = getProfilePhoto(memory.author);
      createdAt = memory.createdAt;
      isAuthor = memory.author == caller;
    };
  };

  func paginateMemories(memoriesMap : Map.Map<Nat, Memory>, start : Nat, effectiveLimit : Nat, caller : Principal, predicate : (Memory) -> Bool) : PaginatedMemories {
    if (start == 0) {
      return { memories = []; nextCursor = null; hasMore = false };
    };
    let buf = List.empty<MemoryView>();
    let startInt : Int = start;
    for ((_, memory) in memoriesMap.reverseEntriesFrom(Int.abs(startInt - 1))) {
      if (predicate(memory)) {
        if (buf.size() < effectiveLimit) {
          buf.add(toMemoryView(memory, caller));
        } else {
          let arr = buf.toArray();
          return {
            memories = arr;
            nextCursor = ?arr[arr.size() - 1].id;
            hasMore = true;
          };
        };
      };
    };
    { memories = buf.toArray(); nextCursor = null; hasMore = false };
  };

  public query ({ caller }) func getProfile() : async ?Profile {
    requireAuth(caller);
    userProfiles.get(caller);
  };

  public shared ({ caller }) func setProfile(name : Text, photoBlob : ?Storage.ExternalBlob) : async () {
    requireAuth(caller);
    if (name == "") {
      Runtime.trap("Profile name cannot be empty");
    };
    if (name.size() > MAX_PROFILE_NAME) {
      Runtime.trap("Name must be " # MAX_PROFILE_NAME.toText() # " characters or fewer");
    };
    userProfiles.add(caller, { name; photoBlob });
  };

  public shared ({ caller }) func createFamily(name : Text) : async Nat {
    requireAuth(caller);
    requireUnderLimit(getMembershipList(caller).size(), MAX_FAMILIES_PER_USER, "You can join at most " # MAX_FAMILIES_PER_USER.toText() # " families");
    if (name == "") {
      Runtime.trap("Family name cannot be empty");
    };
    if (name.size() > MAX_FAMILY_NAME) {
      Runtime.trap("Family name must be " # MAX_FAMILY_NAME.toText() # " characters or fewer");
    };
    switch (userOwnedFamily.get(caller)) {
      case (?_) { Runtime.trap("You already own a family") };
      case (null) {};
    };
    let id = nextFamilyId;
    nextFamilyId += 1;
    let now = Time.now();
    families.add(id, { id; name; owner = caller; createdAt = now });
    userOwnedFamily.add(caller, id);
    let members = getMemberMap(id);
    let displayName = switch (userProfiles.get(caller)) {
      case (?p) { p.name };
      case (null) { "Owner" };
    };
    members.add(
      caller,
      {
        relationship = #other;
        permissions = {
          canAddMemories = true;
          canAddMeasurementsAndMilestones = true;
          canViewMeasurementsAndMilestones = true;
        };
        displayName;
        joinedAt = now;
      },
    );
    let memberships = getMembershipList(caller);
    memberships.add(id);
    id;
  };

  public query ({ caller }) func getFamily(familyId : Nat) : async ?Family {
    requireAuth(caller);
    requireFamilyMember(caller, familyId);
    families.get(familyId);
  };

  public query ({ caller }) func getUserFamilies() : async [Family] {
    requireAuth(caller);
    switch (userMemberships.get(caller)) {
      case (null) { [] };
      case (?memberships) {
        let result = List.empty<Family>();
        for (familyId in memberships.values()) {
          switch (families.get(familyId)) {
            case (?family) { result.add(family) };
            case (null) {};
          };
        };
        result.toArray();
      };
    };
  };

  public shared ({ caller }) func addDependent(familyId : Nat, kind : MemberKind, name : Text, dateOfBirth : ?Text, petType : ?Text, breed : ?Text, sex : ?PetSex, adoptionDate : ?Text, photoBlob : ?Storage.ExternalBlob) : async Nat {
    requireAuth(caller);
    requireFamilyOwner(caller, familyId);
    validateName(name, "Name");
    switch (petType) {
      case (?pt) {
        if (pt.size() > MAX_TYPE_BREED) {
          Runtime.trap("Pet type must be " # MAX_TYPE_BREED.toText() # " characters or fewer");
        };
      };
      case (null) {};
    };
    switch (breed) {
      case (?b) {
        if (b.size() > MAX_TYPE_BREED) {
          Runtime.trap("Breed must be " # MAX_TYPE_BREED.toText() # " characters or fewer");
        };
      };
      case (null) {};
    };
    requireUnderLimit(getDependentMap(familyId).size(), MAX_DEPENDENTS_PER_FAMILY, "A family can have at most " # MAX_DEPENDENTS_PER_FAMILY.toText() # " dependents");
    let id = nextDependentId;
    nextDependentId += 1;
    let deps = getDependentMap(familyId);
    deps.add(id, { id; familyId; kind; name; dateOfBirth; petType; breed; sex; adoptionDate; photoBlob });
    id;
  };

  public shared ({ caller }) func updateDependent(familyId : Nat, dependentId : Nat, name : Text, dateOfBirth : ?Text, petType : ?Text, breed : ?Text, sex : ?PetSex, adoptionDate : ?Text, photoBlob : ?Storage.ExternalBlob) : async () {
    requireAuth(caller);
    requireFamilyOwner(caller, familyId);
    validateName(name, "Name");
    switch (petType) {
      case (?pt) {
        if (pt.size() > MAX_TYPE_BREED) {
          Runtime.trap("Pet type must be " # MAX_TYPE_BREED.toText() # " characters or fewer");
        };
      };
      case (null) {};
    };
    switch (breed) {
      case (?b) {
        if (b.size() > MAX_TYPE_BREED) {
          Runtime.trap("Breed must be " # MAX_TYPE_BREED.toText() # " characters or fewer");
        };
      };
      case (null) {};
    };
    let deps = getDependentMap(familyId);
    switch (deps.get(dependentId)) {
      case (?existing) {
        deps.add(dependentId, { id = dependentId; familyId; kind = existing.kind; name; dateOfBirth; petType; breed; sex; adoptionDate; photoBlob });
      };
      case (null) { Runtime.trap("Dependent not found") };
    };
  };

  public shared ({ caller }) func removeDependent(familyId : Nat, dependentId : Nat) : async () {
    requireAuth(caller);
    requireFamilyOwner(caller, familyId);
    let deps = getDependentMap(familyId);
    switch (deps.get(dependentId)) {
      case (?_) {
        cascadeDeleteMember(familyId, dependentId);
        // Remove growth measurements for this dependent
        switch (growthMeasurements.get(familyId)) {
          case (?measurements) {
            let toRemove = List.empty<Nat>();
            for ((id, m) in measurements.entries()) {
              if (m.dependentId == dependentId) { toRemove.add(id) };
            };
            for (id in toRemove.values()) { measurements.remove(id) };
          };
          case (null) {};
        };
        deps.remove(dependentId);
      };
      case (null) { Runtime.trap("Dependent not found") };
    };
  };

  public query ({ caller }) func getFamilyDependents(familyId : Nat) : async [Dependent] {
    requireAuth(caller);
    requireFamilyMember(caller, familyId);
    switch (familyDependents.get(familyId)) {
      case (null) { [] };
      case (?deps) {
        let result = List.empty<Dependent>();
        for ((_, dep) in deps.entries()) {
          result.add(dep);
        };
        result.toArray();
      };
    };
  };

  public shared ({ caller }) func createMemory(
    familyId : Nat,
    date : Text,
    caption : ?Text,
    mediaBlobs : [Storage.ExternalBlob],
    mediaTypes : [Text],
    taggedMemberIds : [Nat],
    milestoneKey : ?Text,
    milestoneMemberId : ?Nat,
  ) : async Nat {
    requireAuth(caller);
    requireCanAddMemories(caller, familyId);
    requireUnderLimit(getMemoryMap(familyId).size(), MAX_MEMORIES_PER_FAMILY, "A family can have at most " # MAX_MEMORIES_PER_FAMILY.toText() # " memories");
    if (date == "") {
      Runtime.trap("Date is required");
    };
    switch (caption) {
      case (?c) {
        if (c.size() > 500) {
          Runtime.trap("Caption must be 500 characters or fewer");
        };
      };
      case (null) {};
    };
    // At least one of caption or media required
    let hasCaption = switch (caption) {
      case (?c) { c != "" };
      case (null) { false };
    };
    if (not hasCaption and mediaBlobs.size() == 0) {
      Runtime.trap("Memory must have a caption or at least one media item");
    };
    if (mediaBlobs.size() != mediaTypes.size()) {
      Runtime.trap("mediaBlobs and mediaTypes must have the same length");
    };
    if (mediaBlobs.size() > MAX_MEDIA_PER_MEMORY) {
      Runtime.trap("A memory can have at most " # MAX_MEDIA_PER_MEMORY.toText() # " media items");
    };
    for (mt in mediaTypes.vals()) {
      if (not isValidMediaType(mt)) {
        Runtime.trap("Invalid media type: " # mt # ". Must be \"image\" or \"video\"");
      };
    };
    validateTaggedMemberIds(taggedMemberIds, familyId);
    validateMilestoneMemberId(milestoneMemberId, familyId);
    let id = nextMemoryId;
    nextMemoryId += 1;
    let memories = getMemoryMap(familyId);
    memories.add(
      id,
      {
        id;
        familyId;
        date;
        caption;
        mediaBlobs;
        mediaTypes;
        taggedMemberIds;
        milestoneKey;
        milestoneMemberId;
        author = caller;
        createdAt = Time.now();
      },
    );
    id;
  };

  public query ({ caller }) func getMemoriesByDate(familyId : Nat, date : Text) : async [MemoryView] {
    requireAuth(caller);
    requireFamilyMember(caller, familyId);
    switch (familyMemories.get(familyId)) {
      case (null) { [] };
      case (?memories) {
        let result = List.empty<MemoryView>();
        for ((_, memory) in memories.entries()) {
          if (memory.date == date) {
            result.add(toMemoryView(memory, caller));
          };
        };
        result.toArray();
      };
    };
  };

  public shared ({ caller }) func updateMemory(
    familyId : Nat,
    memoryId : Nat,
    date : Text,
    caption : ?Text,
    mediaBlobs : [Storage.ExternalBlob],
    mediaTypes : [Text],
    taggedMemberIds : [Nat],
    milestoneKey : ?Text,
    milestoneMemberId : ?Nat,
  ) : async () {
    requireAuth(caller);
    requireCanAddMemories(caller, familyId);
    let memories = getMemoryMap(familyId);
    switch (memories.get(memoryId)) {
      case (?existing) {
        if (existing.author != caller and not isOwner(caller, familyId)) {
          Runtime.trap("Only the author or family owner can edit this memory");
        };
        if (date == "") {
          Runtime.trap("Date is required");
        };
        switch (caption) {
          case (?c) {
            if (c.size() > 500) {
              Runtime.trap("Caption must be 500 characters or fewer");
            };
          };
          case (null) {};
        };
        let hasCaption = switch (caption) {
          case (?c) { c != "" };
          case (null) { false };
        };
        if (not hasCaption and mediaBlobs.size() == 0) {
          Runtime.trap("Memory must have a caption or at least one media item");
        };
        if (mediaBlobs.size() != mediaTypes.size()) {
          Runtime.trap("mediaBlobs and mediaTypes must have the same length");
        };
        if (mediaBlobs.size() > MAX_MEDIA_PER_MEMORY) {
          Runtime.trap("A memory can have at most " # MAX_MEDIA_PER_MEMORY.toText() # " media items");
        };
        for (mt in mediaTypes.vals()) {
          if (not isValidMediaType(mt)) {
            Runtime.trap("Invalid media type: " # mt # ". Must be \"image\" or \"video\"");
          };
        };
        validateTaggedMemberIds(taggedMemberIds, familyId);
        validateMilestoneMemberId(milestoneMemberId, familyId);
        memories.add(
          memoryId,
          {
            id = memoryId;
            familyId;
            date;
            caption;
            mediaBlobs;
            mediaTypes;
            taggedMemberIds;
            milestoneKey;
            milestoneMemberId;
            author = existing.author;
            createdAt = existing.createdAt;
          },
        );
      };
      case (null) { Runtime.trap("Memory not found") };
    };
  };

  public shared ({ caller }) func deleteMemory(familyId : Nat, memoryId : Nat) : async () {
    requireAuth(caller);
    requireCanAddMemories(caller, familyId);
    let memories = getMemoryMap(familyId);
    switch (memories.get(memoryId)) {
      case (?existing) {
        if (existing.author != caller and not isOwner(caller, familyId)) {
          Runtime.trap("Only the author or family owner can delete this memory");
        };
        memories.remove(memoryId);
        memoryLikes.remove(memoryId);
        memoryComments.remove(memoryId);
      };
      case (null) { Runtime.trap("Memory not found") };
    };
  };

  public query ({ caller }) func getMemberMomentCount(familyId : Nat, memberId : Nat) : async Nat {
    requireAuth(caller);
    requireFamilyMember(caller, familyId);
    switch (familyMemories.get(familyId)) {
      case (null) { 0 };
      case (?memories) {
        var count = 0;
        for ((_, memory) in memories.entries()) {
          if (arrayContains(memory.taggedMemberIds, memberId)) {
            count += 1;
          };
        };
        count;
      };
    };
  };

  public query ({ caller }) func getMonthSummary(familyId : Nat, year : Nat, month : Nat, memberId : ?Nat) : async [DaySummary] {
    requireAuth(caller);
    requireFamilyMember(caller, familyId);
    if (month < 1 or month > 12) {
      Runtime.trap("Month must be between 1 and 12");
    };
    let monthStr = if (month < 10) { "0" # month.toText() } else {
      month.toText();
    };
    let prefix = year.toText() # "-" # monthStr # "-";
    switch (familyMemories.get(familyId)) {
      case (null) { [] };
      case (?memories) {
        let dayData = Map.empty<Text, (Nat, Memory)>();
        for ((_, memory) in memories.entries()) {
          if (dateHasPrefix(memory.date, prefix)) {
            let matchesMember = switch (memberId) {
              case (null) { true };
              case (?mid) { arrayContains(memory.taggedMemberIds, mid) };
            };
            if (matchesMember) {
              switch (dayData.get(memory.date)) {
                case (?(count, existing)) {
                  let newest = if (memory.createdAt > existing.createdAt) {
                    memory;
                  } else { existing };
                  dayData.add(memory.date, (count + 1, newest));
                };
                case (null) {
                  dayData.add(memory.date, (1, memory));
                };
              };
            };
          };
        };
        let result = List.empty<DaySummary>();
        for ((date, (memoryCount, newest)) in dayData.entries()) {
          let previewBlob : ?Storage.ExternalBlob = if (newest.mediaBlobs.size() > 0) {
            ?newest.mediaBlobs[0];
          } else { null };
          let previewCaption : ?Text = if (newest.mediaBlobs.size() == 0) {
            switch (newest.caption) {
              case (?cap) { ?truncateText(cap, 50) };
              case (null) { null };
            };
          } else { null };
          result.add({ date; memoryCount; previewBlob; previewCaption });
        };
        result.toArray();
      };
    };
  };

  public query ({ caller }) func getRecentMemories(familyId : Nat, cursor : ?Nat, limit : Nat, memberId : ?Nat) : async PaginatedMemories {
    requireAuth(caller);
    requireFamilyMember(caller, familyId);
    let effectiveLimit = if (limit == 0 or limit > 50) { 20 } else { limit };
    let start = switch (cursor) {
      case (?c) { c };
      case (null) { nextMemoryId };
    };
    switch (familyMemories.get(familyId)) {
      case (null) { { memories = []; nextCursor = null; hasMore = false } };
      case (?memories) {
        paginateMemories(
          memories,
          start,
          effectiveLimit,
          caller,
          func(memory) {
            switch (memberId) {
              case (null) { true };
              case (?mid) { arrayContains(memory.taggedMemberIds, mid) };
            };
          },
        );
      };
    };
  };

  public query ({ caller }) func getMediaMemories(familyId : Nat, cursor : ?Nat, limit : Nat, memberId : ?Nat) : async PaginatedMemories {
    requireAuth(caller);
    requireFamilyMember(caller, familyId);
    let effectiveLimit = if (limit == 0 or limit > 50) { 20 } else { limit };
    let start = switch (cursor) {
      case (?c) { c };
      case (null) { nextMemoryId };
    };
    switch (familyMemories.get(familyId)) {
      case (null) { { memories = []; nextCursor = null; hasMore = false } };
      case (?memories) {
        paginateMemories(
          memories,
          start,
          effectiveLimit,
          caller,
          func(memory) {
            if (memory.mediaBlobs.size() == 0) { return false };
            switch (memberId) {
              case (null) { true };
              case (?mid) { arrayContains(memory.taggedMemberIds, mid) };
            };
          },
        );
      };
    };
  };

  public shared ({ caller }) func generateInviteCode(familyId : Nat) : async Text {
    requireAuth(caller);
    requireFamilyOwner(caller, familyId);
    var code = generateCodeStr();
    while (inviteCodes.get(code) != null) {
      code := generateCodeStr();
    };
    inviteCodes.add(code, { code; familyId; createdAt = Time.now() });
    code;
  };

  public shared ({ caller }) func redeemInviteCode(code : Text, relationship : Relationship) : async Family {
    requireAuth(caller);
    requireUnderLimit(getMembershipList(caller).size(), MAX_FAMILIES_PER_USER, "You can join at most " # MAX_FAMILIES_PER_USER.toText() # " families");
    switch (inviteCodes.get(code)) {
      case (null) { Runtime.trap("Invalid invite code") };
      case (?invite) {
        let familyId = invite.familyId;
        switch (families.get(familyId)) {
          case (null) { Runtime.trap("Family not found") };
          case (?family) {
            let members = getMemberMap(familyId);
            switch (members.get(caller)) {
              case (?_) {
                Runtime.trap("You are already a member of this family");
              };
              case (null) {
                let displayName = switch (userProfiles.get(caller)) {
                  case (?p) { p.name };
                  case (null) { "Member" };
                };
                members.add(
                  caller,
                  {
                    relationship;
                    permissions = {
                      canAddMemories = false;
                      canAddMeasurementsAndMilestones = false;
                      canViewMeasurementsAndMilestones = true;
                    };
                    displayName;
                    joinedAt = Time.now();
                  },
                );
                let memberships = getMembershipList(caller);
                memberships.add(familyId);
                inviteCodes.remove(code);
                family;
              };
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getFamilyMembers(familyId : Nat) : async [FamilyMemberView] {
    requireAuth(caller);
    requireFamilyOwner(caller, familyId);
    let ownerPrincipal = switch (families.get(familyId)) {
      case (?family) { family.owner };
      case (null) { Runtime.trap("Family not found") };
    };
    switch (familyMembers.get(familyId)) {
      case (null) { [] };
      case (?members) {
        let result = List.empty<FamilyMemberView>();
        for ((principal, member) in members.entries()) {
          result.add({
            principal;
            relationship = member.relationship;
            permissions = member.permissions;
            displayName = member.displayName;
            joinedAt = member.joinedAt;
            isOwner = principal == ownerPrincipal;
          });
        };
        result.toArray();
      };
    };
  };

  public shared ({ caller }) func updateMemberPermissions(familyId : Nat, member : Principal, permissions : Permissions) : async () {
    requireAuth(caller);
    requireFamilyOwner(caller, familyId);
    if (isOwner(member, familyId)) {
      Runtime.trap("Cannot change owner permissions");
    };
    let members = getMemberMap(familyId);
    switch (members.get(member)) {
      case (?existing) {
        members.add(
          member,
          {
            relationship = existing.relationship;
            permissions;
            displayName = existing.displayName;
            joinedAt = existing.joinedAt;
          },
        );
      };
      case (null) { Runtime.trap("Member not found") };
    };
  };

  public shared ({ caller }) func updateMemberRelationship(familyId : Nat, member : Principal, relationship : Relationship) : async () {
    requireAuth(caller);
    requireFamilyOwner(caller, familyId);
    if (isOwner(member, familyId)) {
      Runtime.trap("Cannot change owner relationship");
    };
    let members = getMemberMap(familyId);
    switch (members.get(member)) {
      case (?existing) {
        members.add(
          member,
          {
            relationship;
            permissions = existing.permissions;
            displayName = existing.displayName;
            joinedAt = existing.joinedAt;
          },
        );
      };
      case (null) { Runtime.trap("Member not found") };
    };
  };

  public shared ({ caller }) func removeFamilyMember(familyId : Nat, member : Principal) : async () {
    requireAuth(caller);
    requireFamilyOwner(caller, familyId);
    if (isOwner(member, familyId)) {
      Runtime.trap("Cannot remove the family owner");
    };
    let members = getMemberMap(familyId);
    switch (members.get(member)) {
      case (?_) {
        members.remove(member);
        // Remove from user's membership list
        switch (userMemberships.get(member)) {
          case (?memberships) {
            let updated = List.empty<Nat>();
            for (fid in memberships.values()) {
              if (fid != familyId) {
                updated.add(fid);
              };
            };
            userMemberships.add(member, updated);
          };
          case (null) {};
        };
      };
      case (null) { Runtime.trap("Member not found") };
    };
  };

  public query ({ caller }) func getMyPermissions(familyId : Nat) : async MyPermissions {
    requireAuth(caller);
    requireFamilyMember(caller, familyId);
    if (isOwner(caller, familyId)) {
      return {
        isOwner = true;
        canAddMemories = true;
        canAddMeasurementsAndMilestones = true;
        canViewMeasurementsAndMilestones = true;
      };
    };
    switch (familyMembers.get(familyId)) {
      case (?members) {
        switch (members.get(caller)) {
          case (?member) {
            {
              isOwner = false;
              canAddMemories = member.permissions.canAddMemories;
              canAddMeasurementsAndMilestones = member.permissions.canAddMeasurementsAndMilestones;
              canViewMeasurementsAndMilestones = member.permissions.canViewMeasurementsAndMilestones;
            };
          };
          case (null) { Runtime.trap("Not a member of this family") };
        };
      };
      case (null) { Runtime.trap("Not a member of this family") };
    };
  };

  public query ({ caller }) func getMemoriesForMilestone(familyId : Nat, memberId : Nat, milestoneKey : Text) : async [MemoryView] {
    requireAuth(caller);
    requireCanViewMeasurements(caller, familyId);
    switch (familyMemories.get(familyId)) {
      case (null) { [] };
      case (?memories) {
        let result = List.empty<MemoryView>();
        for ((_, memory) in memories.entries()) {
          switch (memory.milestoneKey, memory.milestoneMemberId) {
            case (?mk, ?mid) {
              if (mk == milestoneKey and mid == memberId) {
                result.add(toMemoryView(memory, caller));
              };
            };
            case (_, _) {};
          };
        };
        result.toArray();
      };
    };
  };

  public query ({ caller }) func getAchievedMilestoneKeys(familyId : Nat, memberId : Nat) : async [Text] {
    requireAuth(caller);
    requireCanViewMeasurements(caller, familyId);
    switch (familyMemories.get(familyId)) {
      case (null) { [] };
      case (?memories) {
        let seen = Map.empty<Text, Bool>();
        for ((_, memory) in memories.entries()) {
          switch (memory.milestoneKey, memory.milestoneMemberId) {
            case (?mk, ?mid) {
              if (mid == memberId) {
                seen.add(mk, true);
              };
            };
            case (_, _) {};
          };
        };
        let result = List.empty<Text>();
        for ((key, _) in seen.entries()) {
          result.add(key);
        };
        result.toArray();
      };
    };
  };

  public shared ({ caller }) func createCustomMilestone(familyId : Nat, memberId : Nat, name : Text, category : ?Text) : async Text {
    requireAuth(caller);
    requireCanAddMeasurements(caller, familyId);
    requireUnderLimit(getCustomMilestoneMap(familyId).size(), MAX_CUSTOM_MILESTONES_PER_FAMILY, "A family can have at most " # MAX_CUSTOM_MILESTONES_PER_FAMILY.toText() # " custom milestones");
    if (name == "") {
      Runtime.trap("Milestone name is required");
    };
    if (name.size() > 200) {
      Runtime.trap("Milestone name must be 200 characters or fewer");
    };
    switch (getDependentMap(familyId).get(memberId)) {
      case (?_) {};
      case (null) { Runtime.trap("Member not found in this family") };
    };
    let id = nextCustomMilestoneId;
    nextCustomMilestoneId += 1;
    let key = "custom-" # id.toText();
    let effectiveCategory = switch (category) {
      case (?c) {
        if (c == "") { "Custom" } else {
          if (c.size() > MAX_CATEGORY) {
            Runtime.trap("Category must be " # MAX_CATEGORY.toText() # " characters or fewer");
          };
          c;
        };
      };
      case (null) { "Custom" };
    };
    let customs = getCustomMilestoneMap(familyId);
    let mapKey = milestoneMapKey(memberId, key);
    customs.add(mapKey, { key; memberId; familyId; name; category = effectiveCategory });
    key;
  };

  public shared ({ caller }) func deleteCustomMilestone(familyId : Nat, memberId : Nat, milestoneKey : Text) : async () {
    requireAuth(caller);
    requireCanAddMeasurements(caller, familyId);
    let customs = getCustomMilestoneMap(familyId);
    let mapKey = milestoneMapKey(memberId, milestoneKey);
    switch (customs.get(mapKey)) {
      case (?_) { customs.remove(mapKey) };
      case (null) { Runtime.trap("Custom milestone not found") };
    };
  };

  public query ({ caller }) func getCustomMilestones(familyId : Nat, memberId : Nat) : async [CustomMilestone] {
    requireAuth(caller);
    requireCanViewMeasurements(caller, familyId);
    switch (customMilestones.get(familyId)) {
      case (null) { [] };
      case (?customs) {
        let result = List.empty<CustomMilestone>();
        for ((_, milestone) in customs.entries()) {
          if (milestone.memberId == memberId) {
            result.add(milestone);
          };
        };
        result.toArray();
      };
    };
  };

  public shared ({ caller }) func addGrowthMeasurement(familyId : Nat, dependentId : Nat, date : Text, heightCm : ?Float, weightKg : ?Float) : async Nat {
    requireAuth(caller);
    requireCanAddMeasurements(caller, familyId);
    requireUnderLimit(getGrowthMap(familyId).size(), MAX_GROWTH_PER_FAMILY, "A family can have at most " # MAX_GROWTH_PER_FAMILY.toText() # " growth measurements");
    let depKind = switch (getDependentMap(familyId).get(dependentId)) {
      case (?dep) { dep.kind };
      case (null) { Runtime.trap("Dependent not found in this family") };
    };
    switch (depKind) {
      case (#child) {
        if (heightCm == null and weightKg == null) {
          Runtime.trap("At least one of height or weight is required");
        };
      };
      case (#pet) {
        if (heightCm != null) {
          Runtime.trap("Height is not tracked for pets");
        };
        if (weightKg == null) {
          Runtime.trap("Weight is required for pet measurements");
        };
      };
    };
    if (date == "") {
      Runtime.trap("Date is required");
    };
    let id = nextGrowthId;
    nextGrowthId += 1;
    let measurements = getGrowthMap(familyId);
    measurements.add(
      id,
      {
        id;
        dependentId;
        familyId;
        date;
        heightCm;
        weightKg;
        recordedAt = Time.now();
      },
    );
    id;
  };

  public query ({ caller }) func getGrowthMeasurements(familyId : Nat, dependentId : Nat) : async [GrowthMeasurementView] {
    requireAuth(caller);
    requireCanViewMeasurements(caller, familyId);
    switch (growthMeasurements.get(familyId)) {
      case (null) { [] };
      case (?measurements) {
        let result = List.empty<GrowthMeasurementView>();
        for ((_, m) in measurements.entries()) {
          if (m.dependentId == dependentId) {
            result.add({
              id = m.id;
              dependentId = m.dependentId;
              date = m.date;
              heightCm = m.heightCm;
              weightKg = m.weightKg;
              recordedAt = m.recordedAt;
            });
          };
        };
        result.sortInPlace(func(a, b) { Int.compare(b.recordedAt, a.recordedAt) });
        result.toArray();
      };
    };
  };

  public shared ({ caller }) func deleteGrowthMeasurement(familyId : Nat, measurementId : Nat) : async () {
    requireAuth(caller);
    requireCanAddMeasurements(caller, familyId);
    let measurements = getGrowthMap(familyId);
    switch (measurements.get(measurementId)) {
      case (?_) { measurements.remove(measurementId) };
      case (null) { Runtime.trap("Measurement not found") };
    };
  };

  public shared ({ caller }) func toggleLike(familyId : Nat, memoryId : Nat) : async LikeInfo {
    requireAuth(caller);
    requireFamilyMember(caller, familyId);
    requireMemoryInFamily(familyId, memoryId);
    let likes = getLikeMap(memoryId);
    let alreadyLiked = switch (likes.get(caller)) {
      case (?_) { true };
      case (null) { false };
    };
    if (alreadyLiked) {
      likes.remove(caller);
    } else {
      likes.add(caller, true);
    };
    { count = likes.size(); likedByMe = not alreadyLiked };
  };

  public query ({ caller }) func getLikes(familyId : Nat, memoryId : Nat) : async LikeInfo {
    requireAuth(caller);
    requireFamilyMember(caller, familyId);
    requireMemoryInFamily(familyId, memoryId);
    switch (memoryLikes.get(memoryId)) {
      case (null) { { count = 0; likedByMe = false } };
      case (?likes) {
        let likedByMe = switch (likes.get(caller)) {
          case (?_) { true };
          case (null) { false };
        };
        { count = likes.size(); likedByMe };
      };
    };
  };

  public shared ({ caller }) func addComment(familyId : Nat, memoryId : Nat, text : Text) : async Nat {
    requireAuth(caller);
    requireFamilyMember(caller, familyId);
    switch (getMemoryMap(familyId).get(memoryId)) {
      case (null) { Runtime.trap("Memory not found") };
      case (?_) {};
    };
    requireUnderLimit(getCommentMap(memoryId).size(), MAX_COMMENTS_PER_MEMORY, "A memory can have at most " # MAX_COMMENTS_PER_MEMORY.toText() # " comments");
    if (text == "") {
      Runtime.trap("Comment text cannot be empty");
    };
    if (text.size() > 300) {
      Runtime.trap("Comment must be 300 characters or fewer");
    };
    let id = nextCommentId;
    nextCommentId += 1;
    let comments = getCommentMap(memoryId);
    comments.add(
      id,
      {
        id;
        memoryId;
        familyId;
        author = caller;
        text;
        createdAt = Time.now();
      },
    );
    id;
  };

  public shared ({ caller }) func deleteComment(familyId : Nat, commentId : Nat, memoryId : Nat) : async () {
    requireAuth(caller);
    requireFamilyMember(caller, familyId);
    requireMemoryInFamily(familyId, memoryId);
    let comments = getCommentMap(memoryId);
    switch (comments.get(commentId)) {
      case (null) { Runtime.trap("Comment not found") };
      case (?comment) {
        let familyOwner = switch (families.get(familyId)) {
          case (?f) { f.owner };
          case (null) { Runtime.trap("Family not found") };
        };
        if (caller != comment.author and caller != familyOwner) {
          Runtime.trap("Only the comment author or family owner can delete comments");
        };
        comments.remove(commentId);
      };
    };
  };

  public query ({ caller }) func getComments(familyId : Nat, memoryId : Nat) : async [CommentView] {
    requireAuth(caller);
    requireFamilyMember(caller, familyId);
    requireMemoryInFamily(familyId, memoryId);
    let familyOwner = switch (families.get(familyId)) {
      case (?f) { f.owner };
      case (null) { Runtime.trap("Family not found") };
    };
    switch (memoryComments.get(memoryId)) {
      case (null) { [] };
      case (?comments) {
        let buf = List.empty<CommentView>();
        for ((_, comment) in comments.entries()) {
          buf.add({
            id = comment.id;
            memoryId = comment.memoryId;
            author = comment.author;
            authorName = getProfileName(comment.author);
            text = comment.text;
            createdAt = comment.createdAt;
            canDelete = caller == comment.author or caller == familyOwner;
          });
        };
        buf.sortInPlace(func(a, b) { Int.compare(a.createdAt, b.createdAt) });
        buf.toArray();
      };
    };
  };

  public query ({ caller }) func getFlashbacks(familyId : Nat, date : Text) : async [MemoryView] {
    requireAuth(caller);
    requireFamilyMember(caller, familyId);
    if (date.size() != 10) { return [] };
    let targetSuffix = dateMonthDay(date);
    switch (familyMemories.get(familyId)) {
      case (null) { [] };
      case (?memories) {
        let result = List.empty<MemoryView>();
        for ((_, memory) in memories.entries()) {
          if (memory.date.size() == 10 and dateMonthDay(memory.date) == targetSuffix and memory.date != date) {
            result.add(toMemoryView(memory, caller));
          };
        };
        result.sortInPlace(func(a, b) { Int.compare(b.createdAt, a.createdAt) });
        result.toArray();
      };
    };
  };

  public query ({ caller }) func searchMemories(familyId : Nat, searchText : Text) : async [MemoryView] {
    requireAuth(caller);
    requireFamilyMember(caller, familyId);
    if (searchText == "") { return [] };
    if (searchText.size() > MAX_SEARCH_TEXT) {
      Runtime.trap("Search text must be " # MAX_SEARCH_TEXT.toText() # " characters or fewer");
    };
    switch (familyMemories.get(familyId)) {
      case (null) { [] };
      case (?memories) {
        let deps = switch (familyDependents.get(familyId)) {
          case (?m) { m };
          case (null) { Map.empty<Nat, Dependent>() };
        };
        let result = List.empty<MemoryView>();
        for ((_, memory) in memories.entries()) {
          var matched = false;
          switch (memory.caption) {
            case (?caption) {
              if (textContainsCI(caption, searchText)) { matched := true };
            };
            case (null) {};
          };
          if (not matched) {
            switch (memory.milestoneKey) {
              case (?key) {
                if (textContainsCI(key, searchText)) { matched := true };
              };
              case (null) {};
            };
          };
          if (not matched) {
            for (memberId in memory.taggedMemberIds.vals()) {
              if (not matched) {
                switch (deps.get(memberId)) {
                  case (?dep) {
                    if (textContainsCI(dep.name, searchText)) {
                      matched := true;
                    };
                  };
                  case (null) {};
                };
              };
            };
          };
          if (matched) { result.add(toMemoryView(memory, caller)) };
        };
        result.sortInPlace(func(a, b) { Int.compare(b.createdAt, a.createdAt) });
        result.toArray();
      };
    };
  };

  public shared ({ caller }) func deleteFamily(familyId : Nat) : async () {
    requireAuth(caller);
    requireFamilyOwner(caller, familyId);
    // Delete all memory reactions and comments
    switch (familyMemories.get(familyId)) {
      case (?memories) {
        for ((id, _) in memories.entries()) {
          memoryLikes.remove(id);
          memoryComments.remove(id);
        };
      };
      case (null) {};
    };
    // Delete family-level data
    familyMemories.remove(familyId);
    familyDependents.remove(familyId);
    customMilestones.remove(familyId);
    growthMeasurements.remove(familyId);
    // Delete invite codes for this family
    let codesToRemove = List.empty<Text>();
    for ((code, invite) in inviteCodes.entries()) {
      if (invite.familyId == familyId) { codesToRemove.add(code) };
    };
    for (code in codesToRemove.values()) { inviteCodes.remove(code) };
    // Remove family members and clean up memberships
    switch (familyMembers.get(familyId)) {
      case (?members) {
        for ((principal, _) in members.entries()) {
          switch (userMemberships.get(principal)) {
            case (?memberships) {
              let updated = List.empty<Nat>();
              for (fid in memberships.values()) {
                if (fid != familyId) { updated.add(fid) };
              };
              userMemberships.add(principal, updated);
            };
            case (null) {};
          };
        };
      };
      case (null) {};
    };
    familyMembers.remove(familyId);
    // Remove owner mapping
    switch (families.get(familyId)) {
      case (?family) { userOwnedFamily.remove(family.owner) };
      case (null) {};
    };
    families.remove(familyId);
  };
};

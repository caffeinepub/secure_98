# Secure

## Overview

Secure is a private family journal app built on the Internet Computer where parents document their children's and pets' milestones, daily moments, and growth — sharing them only with invited family members. Users authenticate with Internet Identity, create a family, add children and pets as dependents, then post memories (photos, videos, captions) to a shared feed organized by calendar date. Grandparents, aunts, uncles, and other trusted family can join via invite codes, react to memories with likes, and leave comments. The app includes milestone tracking, growth charts, "On This Day" flashbacks, search, and full data export.

## Authentication

- Users sign in via Internet Identity.
- Anonymous principals are rejected from all endpoints.
- Each user has a profile with a display name (max 50 characters) and optional profile photo (blob storage).
- Profile setup is required before accessing the app — the profile dialog is mandatory if no profile exists.
- Users without a family are prompted through a setup flow to create or join one.
- Logout clears all TanStack Query caches and resets the app store.

## Core Features

### Families

- A user can create one family (one owned family per user).
- A user can be a member of up to 5 families total (owned + joined).
- Family name: required, max 20 characters.
- The family owner is automatically added as a member with full permissions.
- Users can switch between families they belong to via a header dropdown.
- Users who don't own a family can create one from the Settings view.
- Users can join additional families via invite codes from the Settings view.

### Dependents (Children & Pets)

- Only the family owner can add, edit, or remove dependents.
- Two kinds: `child` and `pet`.
- Maximum 100 dependents per family.

Child profiles:

- Name (required, max 20 characters)
- Date of birth (optional, YYYY-MM-DD)
- Profile photo (optional, blob storage)

Pet profiles:

- Name (required, max 20 characters)
- Type (optional, max 50 characters — options: Dog, Cat, Bird, Fish, Rabbit, Hamster, Reptile, Other)
- Breed (optional, max 50 characters)
- Sex (optional — Male, Female, Unknown)
- Date of birth (optional)
- Adoption date (optional)
- Profile photo (optional, blob storage)

Removing a dependent:

- Cascade-deletes all memories tagged with or milestone-linked to that dependent
- Deletes all associated likes and comments on those memories
- Deletes all custom milestones for that dependent
- Deletes all growth measurements for that dependent

### Memories

- Memories are the core content unit, tied to a specific calendar date (YYYY-MM-DD).
- Multiple memories can exist for the same date.
- Maximum 2,000 memories per family.
- A memory requires at least one of: caption or media.
- Caption: optional, max 500 characters.
- Media: up to 20 items per memory, each either "image" or "video" type.
- Memories can be tagged with one or more dependents (validated against family's dependent list).
- Memories can optionally be linked to a milestone (milestone key + milestone member ID).
- Each memory records its author (principal) and creation timestamp.

Creating memories requires `canAddMemories` permission.

Editing/deleting memories:

- Requires `canAddMemories` permission.
- Only the original author or the family owner can edit or delete a memory.
- Deleting a memory also removes its associated likes and comments.

### Calendar View

- Monthly grid showing days with visual indicators for days that have memories.
- Day summaries include: date, memory count, preview image (first media from newest memory), or truncated caption (max 50 characters) for text-only memories.
- Supports filtering by a specific dependent.
- Navigation between months.
- Tapping a date opens a day detail view showing all memories for that date.

### Feed View

- Reverse-chronological feed of all memories.
- Cursor-based pagination with 20 items per page.
- Supports filtering by dependent.
- Infinite scroll loading.

### Gallery View

- Grid of media-only memories (memories with at least one photo/video).
- Cursor-based pagination with 20 items per page.
- Supports filtering by dependent.
- Lightbox for viewing media full-screen.

### Home Views

The home screen supports three view modes, toggled from the sidebar:

- Calendar (default)
- Feed
- Gallery

## Milestones

### Predefined Milestones

Child milestones — 40 milestones across 5 categories, covering ages 0–6:

- **Cognition** (8): e.g., "Follows moving objects with eyes" (0–3 months), "Understands concept of time" (48–72 months)
- **Communication** (8): e.g., "Coos and makes gurgling sounds" (0–3), "Tells stories using full sentences" (48–72)
- **Fine Motor** (8): e.g., "Opens and closes hands" (0–3), "Writes some letters and numbers" (48–72)
- **Gross Motor** (8): e.g., "Raises head during tummy time" (0–3), "Hops and stands on one foot" (48–72)
- **Social** (8): e.g., "First social smile" (0–3), "Wants to please friends" (48–72)

Pet milestones — 15 milestones across 3 categories:

- **Training** (5): Responds to name, Learns to sit, Learns to stay, Walks on leash, House trained
- **Firsts** (5): First bath, First car ride, First visit to the vet, First night at home, First time at a park
- **Health** (5): First vaccination, Spayed or neutered, First dental cleaning, Microchipped, First grooming session

### Custom Milestones

- Users with `canAddMeasurementsAndMilestones` permission can create custom milestones.
- Maximum 500 custom milestones per family.
- Milestone name: required, max 200 characters.
- Category: optional (defaults to "Custom"), max 50 characters.
- Custom milestones can be deleted by users with appropriate permissions.

### Achieving Milestones

- Milestones are "achieved" by creating a memory with a milestone key and milestone member ID.
- The achieved milestones list is derived from memories — any memory linked to a milestone key for a given dependent counts as achieved.
- Viewing achieved milestones requires `canViewMeasurementsAndMilestones` permission.

## Growth Tracking

- Available for children only (not pets — height is blocked for pets, and only weight is tracked for pets).
- Maximum 1,000 growth measurements per family.
- Each measurement includes: date (required), height in cm (optional for children), weight in kg (optional for children).
- For children: at least one of height or weight is required.
- For pets: only weight is accepted; height is rejected.
- Measurements are sorted in reverse chronological order.
- A line chart visualizes height and weight over time.
- Requires `canAddMeasurementsAndMilestones` permission to add measurements.
- Requires `canViewMeasurementsAndMilestones` permission to view.
- Measurements can be deleted by users with add permission.

## Family Sharing & Access Control

### Invite Codes

- Only the family owner can generate invite codes.
- Codes are 8-character alphanumeric strings (uppercase letters excluding I/O, digits excluding 0/1).
- Each code is single-use — redeemed codes are deleted.
- Codes are not time-limited.

### Joining a Family

- Users redeem an invite code and select their relationship to the family (mother, father, grandmother, grandfather, aunt, uncle, cousin, friend, or other).
- New members join with default permissions: no add memories, no add measurements/milestones, can view measurements/milestones.
- Users who are already members cannot redeem another code for the same family.

### Permissions

Three permission flags per member (owner always has all permissions):

- `canAddMemories` — can create, edit, and delete memories
- `canAddMeasurementsAndMilestones` — can add growth measurements and custom milestones
- `canViewMeasurementsAndMilestones` — can view growth data, milestones, and milestone-linked memories

Only the family owner can:

- Update member permissions
- Update member relationships
- Remove members
- Generate invite codes
- Add/edit/remove dependents
- Delete the family

### Member Management

- Family owner can view all members with their relationship, permissions, display name, and join date.
- Owner can update each member's permissions individually.
- Owner can update each member's relationship.
- Owner can remove members (but cannot remove themselves).
- Removing a member removes them from the family's member list and from the user's membership list.

## Family Interaction

### Likes

- Any family member can toggle a like on a memory (one like per user per memory).
- Likes are a simple toggle — like/unlike.
- Like info shows total count and whether the current user has liked it.

### Comments

- Any family member can comment on memories.
- Maximum 1,000 comments per memory.
- Comment text: required, max 300 characters.
- Comments are sorted chronologically (oldest first).
- Each comment shows the author's display name.
- Comments can be deleted by the comment author or the family owner.

## Flashbacks

- "On This Day" flashbacks show memories from the same month-day in previous years.
- Displayed as a dismissible card at the top of the feed view.
- Grouped by date, showing years ago, preview thumbnail, and caption.
- Tapping a flashback navigates to that day's detail view.
- Dismissal persists for the current day (stored in local storage via Zustand persist).
- Flashback dismissal resets when switching families.

## Search

- Full-text search across all memories in the active family.
- Case-insensitive matching against: captions, milestone keys, and tagged dependent names.
- Search text: max 200 characters.
- Results sorted by newest first.
- Results display with thumbnail, date, tagged member names, and highlighted matching text.
- 300ms debounce on input.

## Export

- Available to family owners from the Settings view.
- Exports all memories via pagination (50 per page) and downloads media blobs.
- Creates a ZIP file containing:
  - Media files organized by date folder (`YYYY-MM-DD/memory-{id}-{n}.jpg` or `.mp4`)
  - `manifest.json` with memory metadata (id, date, caption, tagged members, media file paths, creation timestamp)
- Uses JSZip loaded via CDN.
- Shows progress bar during export.
- File named `secure-export-YYYY-MM-DD.zip`.

## Backend Data Storage

All data uses orthogonal persistence with `var` declarations and `Map` from `mo:core`:

- `userProfiles` — `Map<Principal, Profile>` — display name and photo per user
- `families` — `Map<Nat, Family>` — family id, name, owner, creation timestamp
- `familyMembers` — `Map<Nat, Map<Principal, FamilyMember>>` — per-family member list with relationship, permissions, display name
- `userOwnedFamily` — `Map<Principal, Nat>` — tracks which family each user owns (max 1)
- `userMemberships` — `Map<Principal, List<Nat>>` — all family IDs a user belongs to
- `familyDependents` — `Map<Nat, Map<Nat, Dependent>>` — children and pets per family
- `familyMemories` — `Map<Nat, Map<Nat, Memory>>` — memories per family
- `inviteCodes` — `Map<Text, InviteCode>` — active invite codes
- `customMilestones` — `Map<Nat, Map<Text, CustomMilestone>>` — custom milestones per family, keyed by `{memberId}-{milestoneKey}`
- `growthMeasurements` — `Map<Nat, Map<Nat, GrowthMeasurement>>` — growth data per family
- `memoryLikes` — `Map<Nat, Map<Principal, Bool>>` — likes per memory
- `memoryComments` — `Map<Nat, Map<Nat, Comment>>` — comments per memory

Blob storage is handled via `MixinStorage()` for profile photos and memory media.

## Backend Operations

- All endpoints require authentication (non-anonymous principal).
- Authorization checks: family membership, family ownership, and granular permissions.
- Input validation: field length limits, required fields, valid enum values, valid dependent IDs for tagging.
- Errors use `Runtime.trap()` with descriptive messages.
- Cross-family access prevention: memory operations verify the memory belongs to the specified family.
- Pagination uses cursor-based approach with configurable page size (max 50, default 20).

## User Interface

### Layout

- Sidebar rail on the left with navigation icons (home views, new memory, search, settings, profile/logout).
- Family selector in the header for switching between families.
- Main content area with view routing based on app state.

### Views

- **Landing Page** — shown to unauthenticated users with sign-in prompt.
- **Profile Setup Dialog** — mandatory for new users, editable from sidebar.
- **Family Setup Flow** — guided onboarding to create or join a family and add dependents.
- **Calendar View** — monthly grid with day indicators and member filter.
- **Feed View** — reverse-chronological memory feed with infinite scroll.
- **Gallery View** — media grid with lightbox.
- **Day Detail** — all memories for a selected date.
- **Member Detail** — individual dependent view with stats and moment count.
- **Milestones List** — predefined and custom milestones for a dependent.
- **Milestone Detail** — memories linked to a specific milestone.
- **Growth Tracking** — measurement log and chart for a dependent.
- **Search View** — keyword search with debounced input.
- **Settings View** — family management, member list, invite codes, export, danger zone.

### Dialogs

- Profile Setup Dialog (create/edit profile)
- Create Memory Dialog (date, caption, media, tags, milestone)
- Create Family Dialog
- Join Family Dialog (enter invite code, select relationship)
- Add Member Dialog (add child or pet during setup)
- Add Growth Measurement Dialog
- Add Custom Milestone Dialog
- Delete Family Dialog (confirmation with family name typing)
- Remove Member Dialog
- Member Permissions Sheet (toggle permissions)

## Design System

- Light/dark theme support via `next-themes` with ThemeProvider.
- Default theme: light.
- shadcn/ui component library for dialogs, buttons, separators, progress bars, sheets, scroll areas.
- Sonner toast notifications (positioned bottom-right).
- Zustand for client-side state management with local storage persistence for flashback dismissal.
- TanStack Query for all server state (queries and mutations).
- date-fns for all date formatting and manipulation.

## Error Handling

### Authentication Errors

- "Not authenticated" — anonymous principal attempts any action.

### Authorization Errors

- "Not a member of this family" — non-member access attempt.
- "Only the family owner can perform this action" — non-owner attempts owner-only action.
- "You don't have permission to add memories/measurements" — insufficient permissions.
- "Cannot change owner permissions/relationship" — attempt to modify owner's settings.
- "Cannot remove the family owner" — attempt to remove owner from their own family.

### Validation Errors

- Empty required fields (name, date, comment text).
- Field length exceeded (profile name 50, family name 20, member name 20, caption 500, comment 300, pet type/breed 50, milestone name 200, category 50, search text 200).
- "Memory must have a caption or at least one media item" — empty memory.
- "mediaBlobs and mediaTypes must have the same length" — mismatched arrays.
- Invalid media type (must be "image" or "video").
- Invalid tagged member IDs or milestone member IDs.

### Limit Errors

- "You can join at most 5 families"
- "You already own a family"
- "A family can have at most 100 dependents"
- "A family can have at most 2,000 memories"
- "A memory can have at most 20 media items"
- "A family can have at most 500 custom milestones"
- "A family can have at most 1,000 growth measurements"
- "A memory can have at most 1,000 comments"

### Not Found Errors

- "Family not found", "Dependent not found", "Memory not found", "Member not found", "Comment not found", "Measurement not found", "Custom milestone not found"

### Invite Code Errors

- "Invalid invite code" — code doesn't exist.
- "You are already a member of this family" — already joined.

### Domain-Specific Errors

- "Height is not tracked for pets" — attempting to record height for a pet.
- "Weight is required for pet measurements" — missing weight for pet.

## Privacy & Deletion

- All journal content is private — only the family creator and invited members can access it.
- Removing a dependent cascade-deletes all tagged memories, milestone-linked memories, custom milestones, growth measurements, and associated likes/comments.
- Deleting a family removes everything: all memories (and their likes/comments), dependents, custom milestones, growth measurements, invite codes, member mappings, and the family record itself. All member membership lists are updated accordingly.

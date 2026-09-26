import type { Category } from "./categories";

export type Visibility = "private" | "group";
export type OrganiseStatus = "pending" | "done" | "failed";
export type Coverage = "full" | "partial" | "none";
export type Role = "owner" | "member";

export interface Profile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
}

export interface Group {
  id: string;
  name: string;
  topic?: string | null;
  description?: string | null;
  memberCount: number;
  isDefault: boolean;
  ownerName?: string | null;
  /** Viewer's role, when the viewer is a member. */
  role?: Role | null;
  /** Only present for members (PRD FR-GRP-05). */
  joinCode?: string | null;
}

export interface GroupMember {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: Role;
  joinedAt: string;
}

export interface Note {
  id: string;
  ownerId: string;
  authorName: string;
  groupId: string | null;
  groupName: string | null;
  visibility: Visibility;
  /** Null until organised; UI falls back to the first line of the body. */
  title: string | null;
  body: string;
  category: Category | null;
  tags: string[];
  answerId: string | null;
  answerQuestion: string | null;
  metaLocked: boolean;
  organiseStatus: OrganiseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LibrarySource {
  ref: number;
  type: "library";
  title: string;
  url: string;
  path: string;
}

export interface NoteSource {
  ref: number;
  type: "note";
  title: string;
  noteId: string;
  authorName: string;
  groupId: string | null;
  groupName: string | null;
  excerpt: string;
  viewerIsMember: boolean;
  /** False when the note was deleted or made private after the answer was written. */
  available: boolean;
}

export type Source = LibrarySource | NoteSource;

export interface KeyPoint {
  text: string;
  sourceRefs: number[];
}

export interface Answer {
  id: string;
  userId: string;
  question: string;
  scopeGroupId: string | null;
  scopeName: string;
  /** Plain text / light Markdown with inline [n] citation markers. */
  summary: string;
  keyPoints: KeyPoint[];
  sources: Source[];
  coverage: Coverage;
  /** For partial coverage: what the knowledge base is missing. */
  gap?: string | null;
  latencyMs: number;
  createdAt: string;
}

export interface NoteInput {
  body: string;
  visibility: Visibility;
  groupId: string | null;
  answerId?: string | null;
  title?: string | null;
  category?: Category | null;
  tags?: string[];
}

export interface ApiError {
  error: { code: string; message: string; retry_after_s?: number };
}

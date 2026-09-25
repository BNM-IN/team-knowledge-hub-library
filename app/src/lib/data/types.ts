import type { Answer, Group, Note, NoteInput, Profile } from "../types";

export type GroupDetail = Group & { isMember: boolean };

/** Everything the UI reads or writes. Implemented by the mock store and by Supabase (RLS enforced). */
export interface DataSource {
  viewer(): Promise<Profile | null>;
  updateDisplayName(name: string): Promise<void>;

  myGroups(): Promise<Group[]>;
  group(id: string): Promise<GroupDetail | null>;
  groupNotes(groupId: string): Promise<Note[]>;
  createGroup(input: { name: string; topic?: string; description?: string }): Promise<Group>;
  joinGroup(groupId: string): Promise<{ group: Group; alreadyMember: boolean }>;
  /** Returns null when the code matches no group. */
  joinByCode(code: string): Promise<{ group: Group; alreadyMember: boolean } | null>;

  recentAnswers(limit?: number): Promise<Answer[]>;
  answer(id: string): Promise<Answer | null>;
  saveAnswer(answer: Omit<Answer, "id" | "userId" | "createdAt">): Promise<Answer>;
  /** For the rate limit: timestamps of the viewer's asks since the given time, oldest first. */
  askTimesSince(sinceIso: string): Promise<string[]>;

  latestGroupNotes(limit?: number): Promise<Note[]>;
  myNotes(): Promise<Note[]>;
  note(id: string): Promise<Note | null>;
  /** Signed-out preview for a shared link: group notes only, never the body. */
  notePreview(id: string): Promise<Pick<Note, "id" | "title" | "authorName" | "groupName" | "category" | "updatedAt" | "body"> | null>;
  notesForAnswer(answerId: string): Promise<Note[]>;
  createNote(input: NoteInput): Promise<Note>;
  updateNote(id: string, patch: Partial<NoteInput>): Promise<Note>;
  deleteNote(id: string): Promise<void>;
  /** Kick off organising (WF-2). Returns immediately; status is written back to the note. */
  organiseNote(id: string): Promise<void>;
}

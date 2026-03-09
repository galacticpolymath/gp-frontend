export type JobTourVisibility = "just-teachers" | "me" | "everyone";

export interface JobTourRecord {
  _id: string;
  userId: string;
  ownerName?: string;
  createdDate: string;
  lastEdited: string;
  version: string;
  publishedDate?: string | null;
  isGP: boolean;
  whoCanSee: JobTourVisibility;
  classSubject: string;
  gradeLevel: string;
  tags: string[];
  gpUnitsAssociated: string[];
  explanation: string;
  heading: string;
  assignment: string;
  selectedJobs: string[];
}

export interface JobTourDraft {
  heading: string;
  whoCanSee: JobTourVisibility;
  classSubject: string;
  gradeLevel: string;
  tags: string[];
  gpUnitsAssociated: string[];
  explanation: string;
  assignment: string;
  selectedJobs: string[];
  version: string;
  publishedDate?: string | null;
}

export type JobTourSource = "unit" | "user";

export type JobVizTourVisibility = "private" | "shared";

export interface JobVizTour {
  _id?: string;
  ownerUserId: string;
  name: string;
  unitLabel: string;
  heroCopy: string;
  assignmentCopy: string;
  socCodes: string[];
  tags: string[];
  visibility: JobVizTourVisibility;
  shareSlug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobVizTourDraft {
  name: string;
  unitLabel?: string;
  heroCopy?: string;
  assignmentCopy?: string;
  socCodes: string[];
  tags?: string[];
  visibility?: JobVizTourVisibility;
}

export interface JobVizTourSummary
  extends Pick<JobVizTour, "_id" | "name" | "visibility" | "shareSlug"> {
  updatedAt?: string;
  jobCount: number;
}

import { connectToMongodb } from "../utils/connection";
import type {
  JobVizTour,
  JobVizTourDraft,
  JobVizTourSummary,
} from "../../types/jobVizTour";

export const JOBVIZ_TOURS_COLLECTION = "jobvizTours";

/**
 * Creates a JobViz tour document for the authenticated GP+ teacher.
 * Once the Mongo migration is ready we will insert the validated payload
 * and return the stored tour so the UI can refresh immediately.
 */
export const createJobVizTour = async (
  payload: JobVizTourDraft,
  ownerUserId: string
): Promise<JobVizTour> => {
  await connectToMongodb();
  throw new Error("JobViz tour persistence is not implemented yet.");
};

/**
 * Updates an existing tour. This will enforce ownership rules so teachers
 * can only edit their own drafts.
 */
export const updateJobVizTour = async (
  tourId: string,
  updates: Partial<JobVizTourDraft>,
  ownerUserId: string
): Promise<JobVizTour> => {
  await connectToMongodb();
  throw new Error("JobViz tour persistence is not implemented yet.");
};

/**
 * Lists every tour for a specific teacher so we can render the "My tours" view.
 */
export const getJobVizToursByOwner = async (
  ownerUserId: string
): Promise<JobVizTourSummary[]> => {
  await connectToMongodb();
  throw new Error("JobViz tour persistence is not implemented yet.");
};

/**
 * Exposes a published tour via its share slug so student assignment links can load it.
 */
export const getJobVizTourBySlug = async (
  slug: string
): Promise<JobVizTour | null> => {
  await connectToMongodb();
  throw new Error("JobViz tour persistence is not implemented yet.");
};

/**
 * Returns featured/shared tours for the public GP+ library surface.
 */
export const listSharedJobVizTours = async (): Promise<JobVizTourSummary[]> => {
  await connectToMongodb();
  throw new Error("JobViz tour persistence is not implemented yet.");
};

import axios from "axios";
import type { JobTourDraft, JobTourRecord } from "./jobTourTypes";

type GetJobToursArgs = {
  filterObj: Record<string, unknown>;
  projectionsObj?: Record<string, unknown>;
  limit?: number;
  sort?: Record<string, 1 | -1 | "asc" | "desc" | "ascending" | "descending">;
};

export const getJobTours = async ({
  filterObj,
  projectionsObj,
  limit,
  sort,
}: GetJobToursArgs): Promise<JobTourRecord[]> => {
  const params = new URLSearchParams();
  params.set("filterObj", JSON.stringify(filterObj));
  if (projectionsObj) {
    params.set("projectionsObj", JSON.stringify(projectionsObj));
  }
  if (typeof limit === "number") {
    params.set("limit", String(limit));
  }
  if (sort) {
    params.set("sort", JSON.stringify(sort));
  }
  const { data } = await axios.get<{ jobTours: JobTourRecord[] }>(
    `/api/job-tours/get?${params.toString()}`
  );
  return data?.jobTours ?? [];
};

export const createJobTour = async (
  jobTour: JobTourDraft,
  token: string
) => {
  const { data } = await axios.post<{ msg: string; jobTourId: string }>(
    "/api/job-tours/create",
    { jobTour },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

export const updateJobTour = async (
  jobTourId: string,
  updates: Partial<JobTourDraft>
) => {
  const { data } = await axios.patch<{ msg: string }>(
    "/api/job-tours/update",
    { jobTourId, updates }
  );
  return data;
};

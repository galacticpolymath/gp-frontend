import { Schema } from "mongoose";

/** @deprecated This interface is deprecated and will be removed in future versions. Use `IConnectionJobViz` instead. */
export interface IJobVizConnection {
  job_title: string[];
  soc_code: string[];
}

export interface IJobVizConnectionsWithDeprecatedVals {
  job_title: string[] | string;
  soc_code: string[] | string;
}

export interface IConnectionJobViz {
  job_title: string;
  soc_code: string;
}

export interface IJobVizSection {
  __component: string;
  SectionTitle: string;
  Content: IJobVizConnection[];
  InitiallyExpanded: boolean;
}

const JobVizConnection = new Schema<IJobVizConnection>(
  {
    job_title: [String],
    soc_code: [String],
  },
  { _id: false }
);

export const JobViz = new Schema<IJobVizSection>(
  {
    __component: String,
    SectionTitle: String,
    Content: [JobVizConnection],
    InitiallyExpanded: { type: Boolean, default: true },
  },
  { _id: false }
);

import { Schema } from 'mongoose';

export interface IJobVizConnection {
    job_title: string[];
    soc_code: string[];
}

export interface IJobVizSection {
    __component: string;
    SectionTitle: string;
    Content: IJobVizConnection[];
    InitiallyExpanded: boolean;
}

const JobVizConnection = new Schema<IJobVizConnection>({
  job_title: [String],
  soc_code: [String],
}, { _id: false });

export const JobViz = new Schema<IJobVizSection>({
  __component: String,
  SectionTitle: String,
  Content: [JobVizConnection],
  InitiallyExpanded: { type: Boolean, default: true },
}, { _id: false });

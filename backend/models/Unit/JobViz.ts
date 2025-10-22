import { Schema } from "mongoose";

export interface IJobVizConnections {
    job_title: string[];
    soc_code: string[];
}

export interface IJobVizSection {
    __component: string;
    SectionTitle: string;
    Content: {
        JobVizConnections: IJobVizConnections;
    };
}

export const JobViz = new Schema<IJobVizSection>({
    __component: String,
    SectionTitle: String,
    Content: {
        JobVizConnections: {
            job_title: [String],
            soc_code: [String]
        }
    }
}, { _id: false });

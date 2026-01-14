import { ObjectId } from 'mongodb';
import { Model, Schema, model, models } from 'mongoose';

export interface IJobTour {
    _id: string;
    userId: string; // User ID
    createdDate: Date;
    lastEdited: Date;
    version: string; // Format: MAJOR.MINOR.YYYYMMDD (e.g., 1.4.20250528)
    publishedDate?: Date; // When made public
    isGP: boolean; // Could override Made By, e.g. if a privileged user made it and made it public
    whoCanSee: 'just-teachers' | 'me' | 'everyone'; // Can the public find it in the jobviz public gallery
    classSubject: string;
    gradeLevel: string;
    tags: string[]; // Tags/Keywords
    gpUnitsAssociated: string[]; // Array of Unit IDs (populated from dropdown, can select multiple)
    explanation: string; // Explanation of why you picked these or how you picked these careers
    heading: string; // e.g., "Medical jobs you've never heard of"
    assignment: string; // e.g., "Look at these jobs and rate them based on data and knowing yourself."
    selectedJobs: string[]; // [soc1, soc2, etc]
}

let JobTour = models.jobTours as Model<IJobTour, {}, {}, {}, any, any>;

if (!JobTour) {
    const JobTourSchema = new Schema<IJobTour>(
        {
            userId: { type: String, required: true },
            createdDate: { type: Date, required: true, default: Date.now },
            lastEdited: { type: Date, required: true, default: Date.now },
            version: {
                type: String,
                required: true,
                validate: {
                    validator: function (v: string) {
                        // Validate format: MAJOR.MINOR.YYYYMMDD
                        const versionRegex = /^\d+\.\d+\.\d{8}$/;
                        return versionRegex.test(v);
                    },
                    message: 'Version must be in format MAJOR.MINOR.YYYYMMDD (e.g., 1.4.20250528)',
                },
            },
            publishedDate: { type: Date, required: false },
            isGP: { type: Boolean, required: true, default: false },
            whoCanSee: {
                type: String,
                required: true,
                enum: ['just-teachers', 'me', 'everyone'],
                default: 'everyone',
            },
            classSubject: { type: String, required: true },
            gradeLevel: { type: String, required: true },
            tags: { type: [String], required: true, default: [] },
            gpUnitsAssociated: { type: [String], required: true, default: [] },
            explanation: { type: String, required: true },
            heading: { type: String, required: true },
            assignment: { type: String, required: true },
            selectedJobs: { type: [String], required: true, default: [] },
        },
        {
            timestamps: false, // We're managing createdDate and lastEdited manually
        }
    );

    JobTour = model('jobTours', JobTourSchema);
}

export default JobTour;

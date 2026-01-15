/* eslint-disable no-console */
import { DeleteResult, ProjectionType } from 'mongoose';
import { IJobTour } from '../models/JobTour';
import JobTour from '../models/JobTour';
import { TJobUpdates } from '../../pages/api/job-tours/update';

export type TJobTourToInsert = Omit<IJobTour, "_id" | "createdDate" | "lastEdited">;

const insertJobTour = async (jobTour: TJobTourToInsert) => {
    try {
        console.log('Inserting job tour into database...');

        if (!JobTour) {
            throw new Error(
                'Failed to connect to the database. `jobTours` collection does not exist.'
            );
        }

        const newJobTour = new JobTour({ ...jobTour, createdDate: new Date(), lastEdited: new Date() });
        const saveResult = await newJobTour.save();

        saveResult.validateSync();

        console.log('saveResult: ', saveResult);

        return {
            status: 200,
            msg: `Job tour was saved!`,
            _id: saveResult._id
        };
    } catch (error) {
        const errMsg = `Failed to save job tour into the database. Error message: ${error}`;

        console.error(errMsg);

        return { status: 500, msg: errMsg };
    }
};

const deleteJobTourById = async (_ids: string[]) => {
    try {
        console.log('Attempting to delete job tour with _id:', _ids);

        const deletionResult = await JobTour.deleteOne({ _id: { $in: _ids } });

        console.log('deletionResult: ', deletionResult);

        return {
            status: 200,
            msg: 'Job tour was successfully deleted from the database!',
        };
    } catch (error) {
        console.error('`deleteJobTour` error: ', error);

        return {
            status: 500,
            msg: `Failed to delete job tour from the database. Error message: "${error}"`,
        };
    }
};

const retrieveJobTours = async (
    filterObj: Partial<IJobTour>,
    projectionObj: ProjectionType<Partial<IJobTour>> = {},
    limit: number = 0,
    sort?: Partial<Record<keyof IJobTour, 1 | -1 | 'asc' | 'desc' | 'ascending' | 'descending'>>
) => {
    try {
        if (!JobTour) {
            throw new Error(
                'Failed to connect to the database. `jobTours` collection does not exist.'
            );
        }

        const isFilterObjValid = "userId" in filterObj && typeof filterObj.userId === "string" || "heading" in filterObj && typeof filterObj.heading === 'string'

        if (!isFilterObjValid) {
            throw new Error('Retrieval is only allowed when filtering by userId or heading.');
        }

        if ("heading" in filterObj) {
            const filterObjCustom = {
                heading: {
                    $regex: filterObj.heading, $options: 'i'
                }
            }

            const jobTours = await JobTour.find(filterObjCustom, projectionObj)
                .sort(sort ?? {})
                .limit(limit)
                .lean();

            return { wasSuccessful: true, data: jobTours as IJobTour[] };
        }

        const jobTours = await JobTour.find(filterObj, projectionObj)
            .sort(sort ?? {})
            .limit(limit)
            .lean();

        return { wasSuccessful: true, data: jobTours as IJobTour[] };
    } catch (error) {
        const errMsg = `Failed to get the job tours from the database. Error message: ${error}.`;

        console.error('errMsg in the `retrieveJobTours` function: ', errMsg);

        return { wasSuccessful: false, errMsg: errMsg };
    }
};

const updateJobTour = async (
    filterObj: Pick<IJobTour, "_id">,
    updatedProps: TJobUpdates
) => {
    try {
        if (!JobTour) {
            throw new Error(
                'Failed to connect to the database. `jobTours` collection does not exist.'
            );
        }

        const areUpdatesInvalid =
            "userId" in updatedProps ||
            "isGp" in updatedProps ||
            "_id" in updatedProps

        if (areUpdatesInvalid) {
            throw new Error('Updating userId, isGp, or _id fields is not allowed.');
        }

        if (!("_id" in filterObj)) {
            throw new Error('No `jobTourId` provided. Cannot update job tour.');
        }

        const { modifiedCount, matchedCount } = await JobTour.updateMany(
            filterObj,
            {
                $set: { ...updatedProps, lastEdited: new Date() },
            }
        );

        if (matchedCount === 0) {
            return { errMsg: 'No matching job tours were found in the database.' };
        }

        return { wasSuccessful: modifiedCount >= 1 };
    } catch (error) {
        const errMsg = `Failed to update the target job tour. Error message: ${error}.`;

        console.error(errMsg);

        return { errMsg: errMsg };
    }
};

export {
    insertJobTour,
    deleteJobTourById,
    retrieveJobTours,
    updateJobTour,
};

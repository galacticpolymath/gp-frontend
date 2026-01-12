/* eslint-disable no-console */
import { DeleteResult, ProjectionType } from 'mongoose';
import { IJobTour } from '../models/JobTour';
import JobTour from '../models/JobTour';

const insertJobTour = async (jobTour: IJobTour) => {
    try {
        if (!JobTour) {
            throw new Error(
                'Failed to connect to the database. `jobTours` collection does not exist.'
            );
        }

        const newJobTour = new JobTour(jobTour);
        const saveResult = await newJobTour.save();

        saveResult.validateSync();

        const { heading, _id } = jobTour;

        return {
            status: 200,
            msg: `Job Tour '${heading}' (${_id}) was successfully saved into the database!`,
        };
    } catch (error) {
        const errMsg = `Failed to save job tour into the database. Error message: ${error}`;

        console.error(errMsg);

        return { status: 500, msg: errMsg };
    }
};

const deleteJobTour = async (_id?: unknown, queryPair?: [string, unknown]) => {
    try {
        console.log(
            `Attempting to delete job tour with id ${_id} and queryPair ${JSON.stringify(
                queryPair
            )}`
        );

        if (!JobTour) {
            throw new Error(
                'Failed to connect to the database. `jobTours` collection does not exist.'
            );
        }

        if (!_id && !queryPair) {
            return {
                status: 500,
                msg: 'Both `jobTourId` and `queryPair` are falsy. At least one of them must have a value.',
            };
        }

        if (_id && typeof _id !== 'string') {
            throw new Error('`_id` must be a string.');
        }

        let deletionResult: DeleteResult;

        if (queryPair && queryPair.length > 0) {
            const [key, val] = queryPair;
            deletionResult = await JobTour.deleteOne({ [key]: val });
        } else {
            deletionResult = await JobTour.deleteOne({ _id: { $eq: _id as string } });
        }

        if (deletionResult.deletedCount === 0) {
            return {
                status: 500,
                msg: 'Failed to delete job tour',
            };
        }

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
    filterObj: Partial<IJobTour>,
    updatedProps: Partial<IJobTour>
) => {
    try {
        if (!JobTour) {
            throw new Error(
                'Failed to connect to the database. `jobTours` collection does not exist.'
            );
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
    deleteJobTour,
    retrieveJobTours,
    updateJobTour,
};

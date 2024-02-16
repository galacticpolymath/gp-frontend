/* eslint-disable no-console */
/* eslint-disable indent */
import { PROJECTED_LESSONS_FIELDS } from '../../globalVars';
import Lessons from '../models/lesson';
import { connectToMongodb } from '../utils/connection';

export const getLessons = async (projectedFields = PROJECTED_LESSONS_FIELDS) => {
    try {
        await connectToMongodb();

        let lessons = await Lessons.find({}, projectedFields).sort({ ReleaseDate: -1 }).lean();

        return lessons;
    } catch (error) {
        console.error('Failed to get lessons from the db. Reason: ', error);

        return null;
    }
};
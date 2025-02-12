/* eslint-disable no-console */
import Lessons from '../models/lesson';
import { connectToMongodb } from '../utils/connection';

const insertLesson = async lesson => {
  try {
    await connectToMongodb(
      15_000,
      0,
      true,
    );

    const newLesson = new Lessons(lesson);
    const saveResult = await newLesson.save();

    saveResult.validateSync();

    const { Title, _id } = lesson;

    return { status: 200, msg: `Lesson '${Title}' (${_id}) was successfully saved into the database!` };
  } catch (error) {
    const errMsg = `Failed to save lesson into the database. Error message: ${error}`;

    console.error(errMsg);

    return { status: 500, msg: errMsg };
  }
};

const deleteLesson = async lessonId => {
  try {
    await connectToMongodb(
      15_000,
      0,
      true,
    );

    await Lessons.deleteOne({ _id: lessonId });

    console.log(`Lesson with id ${lessonId} was successfully deleted from the database!`);

    return { status: 200, msg: `Lesson ${lessonId} was successfully deleted from the database!` };
  } catch (error) {

    return { status: 500, msg: `Failed to delete lesson from the database. Error message: "${error}"` };
  }
};

const createFilterObj = keysAndValsForQueryArr => {
  try {
    const areFilterValuesValid = keysAndValsForQueryArr.every(([, filterVal]) => Array.isArray(filterVal));

    if (!areFilterValuesValid) {
      throw new Error('The value for the querying must be an array. Example: { numID: [1,2,3,4] }');
    }

    return {
      filterObj: keysAndValsForQueryArr.reduce((filterObj, keyAndVal) => {
        try {
          const [key, val] = keyAndVal;
          filterObj[key] = { $in: (key === 'numID') ? val.map(lessonNumIdStr => parseInt(lessonNumIdStr)) : val };

          return filterObj;
        } catch (error) {

          return { errMsg: error.message };
        }

      }, {}),
    };
  } catch (error) {
    return {
      errMsg: error.message,
    };
  }
};

const retrieveLessons = async (filterObj = {}, projectionObj = {}, limit = 0, sort = {}) => {
  try {
    const lessons = await Lessons.find(filterObj, projectionObj).sort(sort).limit(limit).lean();

    return { wasSuccessful: true, data: lessons };
  } catch (error) {
    const errMsg = `Failed to get the lesson from the database. Error message: ${error}.`;

    console.error('errMsg in the `retrieveLessons` function: ', errMsg);

    return { wasSuccessful: false, errMsg: errMsg };
  }
};

const updateLesson = async (filterObj = {}, updatedLessonsKeysAndValsObj) => {
  try {
    // an example of lesson being updated: 
    // section.participants[0].name = "John Doe"
    await Lessons.updateMany(filterObj, { $set: updatedLessonsKeysAndValsObj });

    return { wasSuccessful: true };
  } catch (error) {
    const errMsg = `Failed to update the target lesson. Error message: ${error}.`;

    console.error(errMsg);

    return { errMsg: errMsg };
  }
};

export {
  insertLesson,
  deleteLesson,
  retrieveLessons,
  updateLesson,
  createFilterObj,
};
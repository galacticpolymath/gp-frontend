const { deleteLesson } = require('../../apiServices/lessons/deleteLesson');
const { insertLesson } = require('../../apiServices/lessons/insertLesson');
const lesson5Testing = require('../data/lesson5Testing.json');
const dotenv = require('dotenv');


async function asyncLog(...args) {
  const str = args.join(" ");
  console.log(str)
}

describe("Inserting a lesson into the db.", () => {
  it('A lesson should be inserted into the database.', async () => {
    dotenv.config();

    const lessonInsertionResult = await insertLesson(lesson5Testing, process.env.TESTING_JWT)

    expect(lessonInsertionResult.status).toBe(200);

    expect(true).toBe(true);
  }, 1000 * 10);

  afterAll(async () => {
    dotenv.config();

    asyncLog("Waiting 5 seconds before deleting the lesson from the database...")

    await new Promise(res => setTimeout(() => {
      res()
    }, 5_000))

    const lessonDeletionResult = await deleteLesson(lesson5Testing._id, process.env.TESTING_JWT) 

    asyncLog(lessonDeletionResult)
  }, 2000 * 10)
});
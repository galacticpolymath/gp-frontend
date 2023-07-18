const { insertLesson } = require('../../apiServices/lessons/insertLesson');
const lesson5Testing = require('../data/lesson5Testing.json');
const dotenv = require('dotenv');

describe("Inserting a lesson into the db.", () => {
  it('A lesson should be inserted into the database.', async () => {
    dotenv.config();

    const jwt = process.env.TESTING_JWT
    const lessonInsertionResult = await insertLesson(lesson5Testing, jwt)
    
    expect(lessonInsertionResult.status).toBe(200);
  });
});
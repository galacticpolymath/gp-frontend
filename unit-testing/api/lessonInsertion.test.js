
const { insertLesson } = require('../../api-call-fns/lessons/insertLesson.js')
const { deleteLesson } = require('../../api-call-fns/lessons/deleteLesson.js')

describe("Insert test lesson.", () => {
    it('Lesson should be inserted into the mongodb database.', async () => {
        const lesson = { _id: 700, Title: 'This is a test.' };
        const response = await insertLesson(lesson)
        const isObj = (typeof response === 'object') && (response !== null)

        expect(isObj).toBe(true)

        expect(response.status).toBe(200)

        expect(response.msg).toBe(`Lesson '${lesson.Title}' was successfully saved into the database!`)
    });
}, 25_000);

afterAll(async () => {
    console.log('Deleting lesson from database in 10 seconds.')

    await new Promise(res => setTimeout(res, 10_000));

    await deleteLesson(700)

    console.log('Lesson deleted from database.')
}, 15_000)




const { insertLesson } = require('../../api-call-fns/lessons/insertLesson.js')


describe("Insert test lesson.", () => {
    it('Lesson should be inserted into the mongodb database.', async () => {
        const response = await insertLesson({ title: 'This is a test' })
        const isObj = typeof response === 'object'

        expect(isObj).toBe(true)
        expect(response.status).toBe(200)
        expect(response.data.msg).toBe("'This is a test' was inserted into the database.")
    });
});
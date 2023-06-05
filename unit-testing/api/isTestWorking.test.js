
const { insertLesson } = require('../../api-call-fns/lessons/insertLesson.js')


describe("Testing connection of route '/insert-lesson'", () => {
    it('Should make a successful API call. Should receive a 200 response.', async () => {
        const response = await insertLesson({ lesson: { title: 'This is a test'} })
        const isObj = typeof response === 'object'

        expect(isObj).toBe(true)
        expect(response.status).toBe(200)
        expect(response.data.msg).toBe("'This is a test' was inserted into the database.")
    });
});
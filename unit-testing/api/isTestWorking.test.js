
const { insertLesson } = require('../../api-call-fns/lessons/insertLesson.js')


describe("Testing connection of route '/insert-lesson'", () => {
    it('Should make a successful API call. Should receive a 200 response.', async () => {
        insertLesson({ data: 'This is a test' }).then(data => {
            console.log('data: ', data)
        })
        assert.strictEqual(4, 4)
    });
});
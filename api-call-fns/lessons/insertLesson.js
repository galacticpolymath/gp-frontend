const { apiInfo, generateHeaders } = require('../apiData');

const { mainRoute, insertLessonRoute } = apiInfo;

const insertLesson = async reqBody => {
    try {
        const url = `${mainRoute}/${insertLessonRoute}`;
        const headers = generateHeaders()
        const response = await fetch(url, { method: 'POST', body: JSON.stringify(reqBody), headers: headers })
        const { msg } = await response.json() ?? {}

        return { status: response.status, msg: msg };
    } catch (error) {
        console.error('An error has occurred when inserting a new lesson: ', error)
    }
}

module.exports = {
    insertLesson
}
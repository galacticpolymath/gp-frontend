const apiInfo = require('../apiData');

const { mainRoute, insertLessonRoute } = apiInfo;

async function insertLesson(reqBody){
    try {
        const url = `${mainRoute}/${insertLessonRoute}`;
        const response = await fetch(url, { method: 'POST', body: reqBody })
        const data = await response.json()

        
        return { status: response.status, data: data };
    } catch(error){
        console.error('An error has occurred when inserting a new lesson: ', error)
    }
}

module.exports = {
    insertLesson
}
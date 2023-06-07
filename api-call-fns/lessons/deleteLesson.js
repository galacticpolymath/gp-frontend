const { apiInfo, generateHeaders } = require('../apiData');
const { mainRoute, deleteLessonRoute } = apiInfo;

// FOR TESTING PURPOSES AS OF 06/06/2023
async function deleteLesson(lessonId) {
    try {
        const url = `${mainRoute}/${deleteLessonRoute}/${lessonId}`;
        const response = await fetch(url, { method: 'DELETE' })
        const data = await response?.json() ?? {};

        return { status: response.status };
    } catch (error) {
        console.error('An error has occurred when deleting a lesson: ', error)
    }
}

module.exports = {
    deleteLesson
}
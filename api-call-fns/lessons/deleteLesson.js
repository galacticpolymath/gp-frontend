const { apiInfo, generateHeaders } = require('../apiData');
const dotenv = require('dotenv')
const { mainRoute, deleteLessonRoute } = apiInfo;

dotenv.config()

// FOR TESTING PURPOSES AS OF 06/06/2023
const deleteLesson = async lessonId => {
    try {
        const url = `${mainRoute}/${deleteLessonRoute}/${lessonId}`;
        const response = await fetch(url, { method: 'DELETE' })
        const data = await response.json()

        return data;
    } catch (error) {
        const errMsg = `Failed to delete lesson from the database. Error message: "${error}"`;

        return { msg: errMsg };
    }
}

module.exports = {
    deleteLesson
}
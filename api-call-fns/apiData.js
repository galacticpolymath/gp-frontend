let isOnDev = false;

if (process && (process.env.NODE_ENV === 'development')) {
    isOnDev = true;
}

const apiInfo = {
    mainRoute: 'http://localhost:3000/api',
    insertLessonRoute: 'insert-lesson',
    deleteLessonRoute: 'delete-lesson'
}

function generateHeaders() {
    return {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
    }
}

Object.freeze(apiInfo)

module.exports = { apiInfo, generateHeaders }

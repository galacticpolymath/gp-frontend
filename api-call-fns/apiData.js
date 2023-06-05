let isOnDev = false;

if (process && (process.env.NODE_ENV === 'development')) {
    isOnDev = true;
}

const apiInfo = {
    mainRoute: 'http://localhost:3000/api',
    insertLessonRoute: 'insert-lesson'
}

Object.freeze(apiInfo)

module.exports = apiInfo

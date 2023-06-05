let isOnDev = false;

if (process && (process.env.NODE_ENV === 'development')) {
    isOnDev = true;
}

const apiInfo = {
    domain: isOnDev ? 'http://localhost:3000' : 'https://www.galacticpolymath.com',
    insertLessonRoute: 'insert-lesson'
}

Object.freeze(apiInfo)

module.exports = apiInfo

const dotenv = require('dotenv');

dotenv.config();

let isOnDevOrTest = process && ((process.env.NODE_ENV === 'development') || (process.env.NODE_ENV === 'test'));

const apiInfo = {
  mainRoute: isOnDevOrTest ? 'http://localhost:3000/api' : '',
  insertLessonRoute: 'insert-lesson',
  deleteLessonRoute: 'delete-lesson',
  getLessonRoute: 'get-lesson',
};

const generateHeaders = jwt => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${jwt}`,
});

Object.freeze(apiInfo);

module.exports = { apiInfo, generateHeaders };

const { default: axios } = require('axios');
const { apiInfo, generateHeaders } = require('../apiData');
const dotenv = require('dotenv');
const { mainRoute, deleteLessonRoute } = apiInfo;

dotenv.config();

// FOR TESTING PURPOSES AS OF 06/06/2023
const deleteLesson = async (lessonId, jwt) => {
  try {
    const url = `${mainRoute}/${deleteLessonRoute}/${lessonId}`;
    const response = await axios.delete(url, { headers: generateHeaders(jwt) });

    if(response.status !== 200){
      throw new Error(`An error has occurred in deleting the lesson from the db. Status code: ${response.status}`);
    }

    console.log('Successfully deleted the lesson from the database.');

    return { wasSuccessful: true, data: response.data };
  } catch (error) {
    const errMsg = `Failed to delete lesson from the database. Error message: "${error}"`;

    return { wasSuccessful: false, msg: errMsg };
  }
};

module.exports = {
  deleteLesson,
};
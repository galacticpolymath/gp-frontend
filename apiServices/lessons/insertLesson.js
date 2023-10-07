const { apiInfo, generateHeaders } = require('../apiData');
const { default: axios } = require('axios');
const { mainRoute, insertLessonRoute } = apiInfo;

const insertLesson = async (reqBody, jwt) => {
  try {
    const url = `${mainRoute}/${insertLessonRoute}`;
    const headers = generateHeaders(jwt);
    const response = await axios.post(url, reqBody, { headers: headers });

    if(response.status !== 200){
      throw new Error(`Failed to insert lesson into the database. Status code: ${response.status}`);
    }

    return { status: response.status, msg: response?.data?.msg };
  } catch (error) {
    console.error('An error has occurred when inserting a new lesson: ', error);

    return { status: 500, msg: `Failed to insert lesson into the db. Error message: ${error}` };
  }
};

module.exports = {
  insertLesson,
};
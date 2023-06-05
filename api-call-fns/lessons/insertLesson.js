const apiInfo = require('../apiData')
const axios = require('axios')
const { domain, insertLessonRoute } = apiInfo;


async function insertLesson(reqBody){
    try {
        const url = `${domain}/${insertLessonRoute}`
        return await axios.post(url, reqBody)
    } catch(error){
        console.error('An error has occurred when inserting a new lesson: ', error)
    }
}

module.exports = {
    insertLesson
}
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */

export const getLessons = async _ => {
    try{
        const res = await fetch('https://gp-catalog.vercel.app/index.json');
        const lessons = await res.json();

        return lessons;
    } catch (error) {
        console.error('An error has occurred in getting available locales: ', error);
    }
};
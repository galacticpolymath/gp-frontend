/* eslint-disable indent */

const ACCEPTABLE_URL_PROTOCALS = ['https', 'http'];

export const validateHrefStr = (hrefStr, acceptableUrlProtocals = ACCEPTABLE_URL_PROTOCALS) => {
    try {

        if (!hrefStr.includes(':')) {
            // a path was passed
            return hrefStr;
        }

        const urlObj = new URL(hrefStr);

        return acceptableUrlProtocals.includes(urlObj.protocol) ? hrefStr : '';
    } catch (error) {
        console.error('An error has occurred in validating the url. Reason: ', error);

        return '';
    }

};
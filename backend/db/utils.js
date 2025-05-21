/* eslint-disable no-console */
/* eslint-disable indent */


export function createDocument(documentObj, Model) {
    try {
        /** @type {import('mongoose').Document} */
        const document = new Model(documentObj);

        return document;
    } catch (error) {
        console.error('Failed to create target the document. Reason: ', error);

        return null;
    }
}
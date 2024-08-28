/* eslint-disable no-console */
/* eslint-disable indent */

/**
 * Creates mongoose document for the Mongodb database.
 * @param {import('mongoose').Schema} Model A mongoose model.
 * @param {{ _id: string, email: string, password: { hash: string, salt: string, iterations: number } | null, provider: string, roles: string[], providerAccountId: string }} documentObj The object that will be created into the mongoose model.
 * */
export function createDocument(documentObj, Model) {
    try {
        /** @type {import('mongoose').Document} */
        const document = new Model(documentObj);

        return document;
    } catch(error){
        console.error('Failed to create target the document. Reason: ', error);

        return null;
    }
}
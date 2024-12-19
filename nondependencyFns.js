/* eslint-disable indent */

import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import { AuthMiddlewareError } from './backend/utils/errors';

export const getChunks = (arr, chunkSize) => {
    const chunks = [];
    let chunkWindow = [];

    for (let index = 0; index < arr.length; index++) {
        let val = arr[index];

        if (chunkWindow.length === chunkSize) {
            chunks.push(chunkWindow);
            chunkWindow = [];
        }

        chunkWindow.push(val);

        if (index === (arr.length - 1)) {
            chunks.push(chunkWindow);
        }
    }

    return chunks;
};

/**
 * 
 * @param {string} token 
 */
export const verifyJwt = async (token) => {
    /**
     * @type {import('jose').JWTVerifyResult}
     */
    const jwtVerifyResult = await jwtVerify(token, new TextEncoder().encode(process.env.NEXTAUTH_SECRET));

    return jwtVerifyResult;
};

export const getDoesUserHaveSpecifiedRole = (userRoles, targetRole = 'user') => !!userRoles.find(role => role === targetRole);

/**
* @param {string} authorizationStr 
* @param {boolean} willCheckIfUserIsDbAdmin 
* @param {boolean} willCheckForValidEmail 
* @param {string} emailToValidate 
* @returns
*/
export const getAuthorizeReqResult = async (
    authorizationStr,
    willCheckIfUserIsDbAdmin,
    willCheckForValidEmail,
    emailToValidate
) => {
    try {
        const token = authorizationStr.split(' ')[1].trim();
        const verifyJwtResult = await verifyJwt(token);
        /** 
         * @type {TJwtPayload}
        */
        const payload = verifyJwtResult.payload;

        if (!payload) {
            const errMsg = 'You are not authorized to access this service.';
            const response = new NextResponse(errMsg, { status: 403 });

            throw new AuthMiddlewareError(false, response, errMsg);
        }

        const { exp: expTimeSeconds, roles, email } = payload;
        const currentMiliseconds = Date.now();
        const expTimeMiliseconds = expTimeSeconds * 1_000;

        if (!roles.includes('user')) {
            const errMsg = 'You are not authorized to access this service. Invalid token.';
            const response = new NextResponse(errMsg, { status: 498 });

            console.error(errMsg);

            throw new AuthMiddlewareError(false, response, 'You are not authorized to access this service. Invalid token.');
        }

        if (currentMiliseconds > expTimeMiliseconds) {
            const errMsg = 'The json web token has expired.';
            const response = new NextResponse(errMsg, { status: 498 });

            throw new AuthMiddlewareError(false, response, errMsg);
        }

        if (willCheckIfUserIsDbAdmin && !getDoesUserHaveSpecifiedRole(roles, 'dbAdmin')) {
            const errMsg = 'You are not authorized to access this service.';
            const response = new NextResponse(errMsg, { status: 403 });

            throw new AuthMiddlewareError(false, response, errMsg);
        }

        if (willCheckForValidEmail && (emailToValidate && (email !== emailToValidate))) {
            const errMsg = 'You are not authorized to access this service.';
            const response = new NextResponse(errMsg, { status: 403 });

            throw new AuthMiddlewareError(false, response, errMsg);
        } else if (willCheckForValidEmail && !emailToValidate) {
            const errMsg = 'Need an email string ("emailToValide") value for validation.';
            const response = new NextResponse(errMsg, { status: 403 });

            throw new AuthMiddlewareError(false, response, errMsg);
        }

        return { isAuthorize: true };
    } catch (error) {
        const { errResponse, msg } = error ?? {};

        console.error('Error message: ', msg ?? 'Failed to validate jwt.');

        return { isAuthorize: false, errResponse, msg };
    }
};
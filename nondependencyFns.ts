/* eslint-disable indent */

import { JWTPayload, jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import { AuthMiddlewareError } from './backend/utils/errors';



export const getChunks = (arr: unknown[], chunkSize: number) => {
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

interface JWTPayloadCustom extends JWTPayload {
    roles: string[],
    email: string,
    userId: string,
    name: {
        first: string,
        last: string
    }
}

export const verifyJwt = async (token: string) => {
    /**
     * @type {import('jose').JWTVerifyResult}
     */
    const jwtVerifyResult = await jwtVerify<JWTPayloadCustom>(token, new TextEncoder().encode(process.env.NEXTAUTH_SECRET));

    return jwtVerifyResult;
};

export const getDoesUserHaveSpecifiedRole = (userRoles: string[], targetRole = 'user') => !!userRoles.find(role => role === targetRole);

export const getAuthorizeReqResult = async (
    authorizationStr: string,
    willCheckIfUserIsDbAdmin: boolean,
    willCheckForValidEmail: boolean,
    emailToValidate: string
) => {
    try {
        const token = authorizationStr.split(' ')[1].trim();
        const verifyJwtResult = await verifyJwt(token);
        const payload = verifyJwtResult.payload as JWTPayloadCustom;

        if (!payload) {
            const errMsg = 'You are not authorized to access this service.';
            const response = new NextResponse(errMsg, { status: 403 });

            throw new AuthMiddlewareError(false, response, errMsg);
        }

        const { exp: expTimeSeconds, roles, email } = payload;
        const currentMiliseconds = Date.now();
        const expTimeMiliseconds = expTimeSeconds ? expTimeSeconds * 1_000 : null;

        console.log("roles: ", roles)

        if (!roles.includes('user')) {
            const errMsg = 'You are not authorized to access this service. Invalid token.';
            const response = new NextResponse(errMsg, { status: 498 });

            console.error(errMsg);

            throw new AuthMiddlewareError(false, response, 'You are not authorized to access this service. Invalid token.');
        }

        if (expTimeMiliseconds && (currentMiliseconds > expTimeMiliseconds)) {
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
    } catch (error: any) {
        const { errResponse, msg } = error ?? {};

        console.error('Error message: ', msg ?? 'Failed to validate jwt.');

        return { isAuthorize: false, errResponse, msg };
    }
};


/**
 * Given a authorization string, this function will return the payload of the jwt,
 * assuming the jwt is valid. If the authorization string is invalid or the jwt is
 * invalid, this function will return null.
 * @param {string} authorization The authorization string.
 * @returns {Promise<import('jose').JWTVerifyResult | null>}
 */
export const getJwtPayloadPromise = (authorization = '') => {
    if (!authorization) {
        console.error("'authorization' string cannot be empty.")
        return null;
    }

    const authSplit = authorization.split(' ');

    if (authSplit.length !== 2) {
        console.error('The authorization string is in a invalid format.', 422);
        return null;
    }

    return verifyJwt(authSplit[1]);
}


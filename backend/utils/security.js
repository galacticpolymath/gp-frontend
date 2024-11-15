/* eslint-disable no-console */
/* eslint-disable indent */
import { pbkdf2Sync } from 'pbkdf2';
import { nanoid } from 'nanoid';
import { sha256 } from 'js-sha256';
import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import { AuthMiddlwareError } from './errors';

/**
 * @typedef {Object} TJwtPayloadCustomPropties
 * @property {string} email
 * @property {string[]} roles
 */

/**
 * @global
 * @typedef {TJwtPayloadCustomPropties & import('jsonwebtoken').JwtPayload} TJwtPayload
 */

export const createSalt = () => sha256.create().update(nanoid().toString()).hex();

export const createIterations = () => {
    try {
        const {
            MAX_ITERATION_COUNT,
            MIN_ITERATION_COUNT,
        } = process.env;

        if (!MAX_ITERATION_COUNT || !MIN_ITERATION_COUNT || !Number.isInteger(+MAX_ITERATION_COUNT) || !Number.isInteger(+MIN_ITERATION_COUNT)) {
            throw new Error("Couldn't load the necessary environment variables to hash password.");
        }

        return Math.floor(Math.random() * parseInt(MAX_ITERATION_COUNT)) + parseInt(MIN_ITERATION_COUNT);
    } catch (error) {
        console.error('Failed to create iterations. Reason: ', error);

        return null;
    }
};

/**
 * @param {string} password
 * @return {{ salt: string, hash: string, iterations: number }} The result of the hash.
 * */
export function hashPassword(password, salt, iterations) {
    const hashedPassword = pbkdf2Sync(password, salt, iterations, 64, 'sha256');

    return { iterations, salt, hash: hashedPassword.toString() };
}

export class HashedPassword {
    /**
     * 
     * @param {string} password 
     * @param {string} salt 
     * @param {number} iterations 
     */
    constructor(password, salt, iterations) {
        const hashedPassword = pbkdf2Sync(password, salt, iterations, 64, 'sha256');

        this.iterations = iterations;
        this.salt = salt;
        this.hash = hashedPassword.toString();
    }
}

/**
 * @param {{ password: string, salt: string, iterations: number }} passwordToValidateFromClient
 * @param {string} hashedPasswordFromDb
 * @return {boolean}
 * */
export const getIsPasswordCorrect = ({ iterations, password, salt }, hashedPasswordFromDb) => {
    const { hash } = new HashedPassword(password, salt, iterations);

    return hash === hashedPasswordFromDb;
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

            throw new AuthMiddlwareError(false, response, errMsg);
        }

        const { exp, roles, email } = payload;
        const currentTimeUTCMs = new Date().getUTCMilliseconds();

        console.log('expiration time: ', exp);
        console.log('currentTimeUTCMs: ', currentTimeUTCMs);

        if(currentTimeUTCMs > exp){
            const errMsg = 'The json web token has expired.';
            const response = new NextResponse(errMsg, { status: 403 });

            throw new AuthMiddlwareError(false, response, errMsg);
        }

        if (willCheckIfUserIsDbAdmin && !getDoesUserHaveSpecifiedRole(roles, 'dbAdmin')) {
            const errMsg = 'You are not authorized to access this service.';
            const response = new NextResponse(errMsg, { status: 403 });

            throw new AuthMiddlwareError(false, response, errMsg);
        }

        if (willCheckForValidEmail && (email !== emailToValidate)) {
            const errMsg = 'You are not authorized to access this service.';
            const response = new NextResponse(errMsg, { status: 403 });

            throw new AuthMiddlwareError(false, response, errMsg);
        }

        return { isAuthorize: true };
    } catch (error) {
        const { errResponse, msg } = error ?? {};

        console.error('Error message: ', msg ?? 'Failed to validate jwt.');

        return { isAuthorize: false, errResponse, msg };
    }
};
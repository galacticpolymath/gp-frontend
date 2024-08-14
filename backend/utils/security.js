/* eslint-disable no-console */
/* eslint-disable indent */
import { pbkdf2Sync } from 'pbkdf2';
import { nanoid } from 'nanoid';
import { sha256 } from 'js-sha256';
import { jwtVerify } from 'jose';

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
        const { MAX_ITERATION_COUNT, MIN_ITERATION_COUNT } = process.env;

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
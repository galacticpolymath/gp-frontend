/* eslint-disable no-console */
/* eslint-disable indent */
// hash the password
// check if a password is correct 
import { pbkdf2Sync } from 'pbkdf2';
import { nanoid } from 'nanoid';
import { sha256 } from 'js-sha256';

/**
 * @param {string} password
 * @return {{ salt: string, hash: string, iterations: number } | null} The result of the hash. Will return `null` if a error occurs.
 * */
export function hashPassword(password) {
    try {
        const { MAX_ITERATION_COUNT, MIN_ITERATION_COUNT } = process.env;

        if (!MAX_ITERATION_COUNT || !MIN_ITERATION_COUNT || !Number.isInteger(+MAX_ITERATION_COUNT) || !Number.isInteger(+MIN_ITERATION_COUNT)) {
            throw new Error("Couldn't load the necessary environment variables to hash password.");
        }

        const iterations = Math.floor(Math.random() * parseInt(MAX_ITERATION_COUNT)) + parseInt(MIN_ITERATION_COUNT);
        const salt = sha256.create().update(nanoid().toString()).hex();
        const hashedPassword = pbkdf2Sync(password, salt, iterations, 64, 'sha256');

        return { iterations, salt, hash: hashedPassword.toString() };
    } catch (error) {
        console.error('Failed to hash password. Reason: ', error);

        return null;
    }
}

/**
 * @param {{ password: string, salt: string, iterations: number }} passwordToValidate
 * @param {string} hashedPassword
 * @return {boolean}
 * */
export function getIsPasswordCorrect(passwordToValidate, hashedPassword) {
    const { password, salt, iterations } = passwordToValidate;
    const passwordToValidateHashed = pbkdf2Sync(password, salt, iterations, 64, 'sha256').toString();

    return passwordToValidateHashed === hashedPassword;
}
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable no-console */

import { createObj } from "./globalFns";

export class Cookies {
    get(name) {
        const cookies = document.cookie;

        if (!cookies) {
            return null;
        }

        const parsedCookies = this.getAllParsedCookies();

        return parsedCookies[name];
    }

    getAllUnparsedCookies() {
        return document.cookie;
    }

    getAllParsedCookies() {
        const cookiesKeysAndFields = document.cookie.split(';').map(keyAndVal => keyAndVal.split('='));

        return createObj(cookiesKeysAndFields);
    }

    set(name, value, expiration) {
        try {
            if (value.includes('=')) {
                throw new Error('Value must not include a "=" sign.');
            }

            document.cookie = expiration ? `${name}=${value}; expires=${expiration}` : `${name}=${value};`;
        } catch (error) {
            console.error('Failed to set cookies. Reason: ', error);
        }
    }
}
import { useCookies } from "react-cookie";

export const useCustomCookies = (keys = ["token"]) => {
    const [cookiesStore, setCookie, removeCookie] = useCookies(keys)

    const clearCookies = () => {
        const cookies = Object.keys(cookiesStore);

        for (const cookieKey of cookies) {
            removeCookie(cookieKey);
        }
    }

    return {
        cookies: cookiesStore,
        setCookie,
        removeCookie,
        clearCookies
    }
}
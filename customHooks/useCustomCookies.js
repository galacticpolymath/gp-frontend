import { useCookies } from "react-cookie";

export const useCustomCookies = (keys = ["token"]) => {
    const [cookies, setCookie, removeCookie] = useCookies(keys)

    const clearCookies = () => {
        const cookies = Object.keys(cookies);

        for (const cookieKey of cookies) {
            removeCookie(cookieKey);
        }
    }

    return {
        cookies,
        setCookie,
        removeCookie,
        clearCookies
    }
}
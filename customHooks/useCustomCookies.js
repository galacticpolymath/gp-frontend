import { useCookies } from "react-cookie"

export const useCustomCookies = (keys = []) => {
    const [cookies, setCookie, removeCookie] = useCookies(keys)

    const clearCookies = () => {
        let x = Object.keys(cookies);
        for (const cookieKey of x) {
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
import { useCookies } from "react-cookie";

interface IAppCookies {
  gdriveAccessToken: string;
  token: string;
}

export const useCustomCookies = (
  keys: Exclude<keyof IAppCookies, number>[]
) => {
  const [cookiesStore, setCookie, removeCookie] = useCookies<
    string,
    IAppCookies
  >(keys);

  const clearCookies = () => {
    const cookies = Object.keys(cookiesStore);

    for (const cookieKey of cookies) {
      removeCookie(cookieKey);
    }
  };

  return {
    cookies: cookiesStore,
    setCookie,
    removeCookie,
    clearCookies,
  };
};

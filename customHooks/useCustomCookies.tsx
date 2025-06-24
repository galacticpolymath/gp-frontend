import { useCookies } from "react-cookie";

interface IAppCookies {
  gdriveAccessToken: string;
  gdriveRefreshToken: string;
  gdriveAccessTokenExp: number;
  token: string;
}

export const useCustomCookies = (
  keys: Exclude<keyof IAppCookies, number>[] = []
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

  const setAppCookie = <
    TKey extends keyof IAppCookies,
    TVal extends IAppCookies[TKey]
  >(
    key: TKey,
    val: TVal,
    options?: Parameters<typeof setCookie>[2]
  ) => {
    setCookie(key, val, options);
  };

  return {
    cookies: cookiesStore,
    removeCookie,
    clearCookies,
    setAppCookie,
  };
};

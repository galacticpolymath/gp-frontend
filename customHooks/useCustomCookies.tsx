import { useCookies } from "react-cookie";

interface IAppCookies {
  gdriveAccessToken: string;
  gdriveRefreshToken: string;
  gdriveAccessTokenExp: number;
  isSignedInAsGpPlusUser: boolean;
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

  const getCookies = <TKey extends keyof IAppCookies>(
    keys: TKey[]
  ): Partial<Pick<IAppCookies, TKey>> => {
    let cookies: Partial<Pick<IAppCookies, TKey>> = {};

    for (const key of keys) {
      cookies = {
        ...cookies,
        [key]: cookiesStore[key],
      };
    }

    return cookies;
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

  const removeAppCookies = (keys: (keyof IAppCookies)[]) => {
    for (const key of keys) {
      removeCookie(key);
    }
  };

  return {
    cookies: cookiesStore,
    removeCookie,
    clearCookies,
    setAppCookie,
    removeAppCookies,
    getCookies,
  };
};

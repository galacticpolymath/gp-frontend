import { useCookies } from "react-cookie";
import cookies from 'js-cookie';

interface IAppCookies {
  gdriveAccessToken: string;
  gdriveRefreshToken: string;
  gdriveAccessTokenExp: number;
  isSignedInAsGpPlusUser: boolean;
  token: string;
}

export const useCustomCookies = () => {
  const clearCookies = () => {
    const siteCookieKeys = Object.keys(cookies.get());

    console.log("siteCookieKeys, sup there: ", siteCookieKeys);

    for (const cookieKey of siteCookieKeys) {
      cookies.remove(cookieKey, { path: "" });
    }

    console.log("document.cookie: ", document.cookie);
  };

  const getCookies = <TKey extends keyof IAppCookies>(
    keys: TKey[]
  ): Partial<Pick<IAppCookies, TKey>> => {
    let siteCookies = (cookies.get() ?? {}) as Partial<Pick<IAppCookies, TKey>> ;

    for (const key of keys) {
      siteCookies = {
        ...siteCookies,
        [key]: siteCookies[key],
      };
    }

    return siteCookies;
  };

  const setAppCookie = <
    TKey extends keyof IAppCookies,
    TVal extends IAppCookies[TKey]
  >(
    key: TKey,
    val: TVal,
    options?: Parameters<typeof cookies.set>[2]
  ) => {
    cookies.set(
      key,
      typeof val === "string" ? val : JSON.stringify(val),
      options
    );
  };

  const removeAppCookies = (keys: (keyof IAppCookies)[]) => {
    for (const key of keys) {
      cookies.remove(key);
    }
  };

  return {
    cookies,
    clearCookies,
    setAppCookie,
    removeAppCookies,
    getCookies,
  };
};

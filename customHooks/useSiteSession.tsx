import { signOut, useSession } from "next-auth/react";
import { IUserSession } from "../types/global";
import { useCustomCookies } from "./useCustomCookies";

const useSiteSession = () => {
  const session = useSession();
  const { data, status } = session ?? {};
  const { user, token } = (data ?? {}) as IUserSession;
  const { clearCookies, getCookies } = useCustomCookies();
  const gdriveTokensInfo = getCookies([
    "gdriveAccessToken",
    "gdriveRefreshToken",
    "gdriveEmail",
    "gdriveAccessTokenExp",
    "isGpPlusMember",
  ]);
  const storedGpPlusMember = (() => {
    if (typeof window === "undefined") return undefined;
    const value = window.sessionStorage.getItem("isGpPlusUser");
    if (value === null) return undefined;
    return value === "true";
  })();
  const resolvedIsGpPlusMember =
    gdriveTokensInfo.isGpPlusMember ?? storedGpPlusMember;
  if (typeof window !== "undefined") {
    console.log("[GP+ debug] useSiteSession cookies:", gdriveTokensInfo);
    console.log("[GP+ debug] useSiteSession sessionStorage isGpPlusUser:", storedGpPlusMember);
    console.log("[GP+ debug] useSiteSession resolved isGpPlusMember:", resolvedIsGpPlusMember);
  }

  const logUserOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    clearCookies();
    signOut();
  };

  return {
    ...gdriveTokensInfo,
    isGpPlusMember: resolvedIsGpPlusMember,
    user,
    token,
    status,
    logUserOut,
    session: {
      ...data,
      ...session,
    },
  };
};

export default useSiteSession;

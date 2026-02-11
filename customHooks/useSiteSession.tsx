import { signOut, useSession } from "next-auth/react";
import { IUserSession } from "../types/global";
import { useCustomCookies } from "./useCustomCookies";

const useSiteSession = () => {
  const session = useSession();
  const { data, status } = session ?? {};
  const { user, token } = (data ?? {}) as IUserSession;
  const normalizedUser = user
    ? {
        ...user,
        userId:
          typeof user.userId === "string"
            ? user.userId
            : user.userId
              ? String(user.userId)
              : undefined,
      }
    : user;
  const { clearCookies, getCookies } = useCustomCookies();
  const gdriveTokensInfo = getCookies([
    "gdriveAccessToken",
    "gdriveRefreshToken",
    "gdriveEmail",
    "gdriveAccessTokenExp",
    "isGpPlusMember",
  ]);
  const normalizedCookieGpPlus = (() => {
    const value = gdriveTokensInfo.isGpPlusMember;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value === "true";
    return undefined;
  })();
  const storedGpPlusMember = (() => {
    if (typeof window === "undefined") return undefined;
    const value = window.sessionStorage.getItem("isGpPlusUser");
    if (value === null) return undefined;
    return value === "true";
  })();
  const resolvedIsGpPlusMember =
    typeof normalizedCookieGpPlus === "boolean"
      ? normalizedCookieGpPlus
      : storedGpPlusMember;

  const logUserOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    clearCookies();
    signOut();
  };

  return {
    ...gdriveTokensInfo,
    isGpPlusMember: resolvedIsGpPlusMember,
    user: normalizedUser,
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

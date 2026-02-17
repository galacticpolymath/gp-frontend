import { signOut, useSession } from "next-auth/react";
import { IUserSession } from "../types/global";
import { useCustomCookies } from "./useCustomCookies";
import { useEffect, useState } from "react";
import axios from "axios";

const GP_PLUS_STATUS_STORAGE_KEY = "isGpPlusUser";
const GP_PLUS_EMAIL_STORAGE_KEY = "isGpPlusUserEmail";

const useSiteSession = () => {
  const session = useSession();
  const { data, status } = session ?? {};
  const { user, token } = (data ?? {}) as IUserSession;
  const [resolvedIsGpPlusMember, setResolvedIsGpPlusMember] = useState<
    boolean | undefined
  >(undefined);
  const normalizedUser = user
    ? {
        ...user,
        image:
          typeof user.image === "string" && user.image
            ? user.image
            : typeof (user as any).picture === "string" &&
                (user as any).picture
              ? (user as any).picture
              : undefined,
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
    const value = window.sessionStorage.getItem(GP_PLUS_STATUS_STORAGE_KEY);
    if (value === null) return undefined;
    return value === "true";
  })();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const signedInEmail =
      typeof normalizedUser?.email === "string"
        ? normalizedUser.email.toLowerCase()
        : "";
    const cachedEmail = (
      window.sessionStorage.getItem(GP_PLUS_EMAIL_STORAGE_KEY) || ""
    ).toLowerCase();

    if (signedInEmail && cachedEmail && signedInEmail !== cachedEmail) {
      window.sessionStorage.removeItem(GP_PLUS_STATUS_STORAGE_KEY);
      window.sessionStorage.removeItem(GP_PLUS_EMAIL_STORAGE_KEY);
    }

    const cachedValue = window.sessionStorage.getItem(GP_PLUS_STATUS_STORAGE_KEY);
    if (cachedValue === "true" || cachedValue === "false") {
      setResolvedIsGpPlusMember(cachedValue === "true");
      return;
    }

    if (typeof normalizedCookieGpPlus === "boolean") {
      setResolvedIsGpPlusMember(normalizedCookieGpPlus);
      return;
    }

    if (typeof storedGpPlusMember === "boolean") {
      setResolvedIsGpPlusMember(storedGpPlusMember);
      return;
    }

    setResolvedIsGpPlusMember(undefined);
  }, [normalizedCookieGpPlus, normalizedUser?.email, storedGpPlusMember]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (status !== "authenticated") return;
    if (!token) return;

    let isCancelled = false;
    axios
      .get<{ isGpPlusMember?: boolean }>("/api/get-user-account-data", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(({ data }) => {
        if (isCancelled) return;
        if (typeof data?.isGpPlusMember !== "boolean") return;

        const isGpPlusMember = data.isGpPlusMember;
        const userEmail =
          typeof normalizedUser?.email === "string"
            ? normalizedUser.email.toLowerCase()
            : "";

        window.sessionStorage.setItem(
          GP_PLUS_STATUS_STORAGE_KEY,
          String(isGpPlusMember)
        );
        if (userEmail) {
          window.sessionStorage.setItem(GP_PLUS_EMAIL_STORAGE_KEY, userEmail);
        }

        document.cookie = `isGpPlusMember=${String(
          isGpPlusMember
        )}; path=/; SameSite=Lax`;
        setResolvedIsGpPlusMember(isGpPlusMember);
      })
      .catch(() => {
        // Keep existing cached state if refresh fails.
      });

    return () => {
      isCancelled = true;
    };
  }, [normalizedUser?.email, status, token]);

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

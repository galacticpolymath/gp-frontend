import { signOut, useSession } from "next-auth/react";
import { IUserSession } from "../types/global";
import { useCustomCookies } from "./useCustomCookies";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

const GP_PLUS_STATUS_STORAGE_KEY = "isGpPlusUser";
const GP_PLUS_EMAIL_STORAGE_KEY = "isGpPlusUserEmail";
let gpPlusStatusInFlight:
  | Promise<{ email: string; isGpPlusMember: boolean } | null>
  | null = null;

const useSiteSession = () => {
  const session = useSession();
  const { data, status } = session ?? {};
  const { user, token } = (data ?? {}) as IUserSession;
  const authorizationHeader =
    typeof token === "string" && token.startsWith("Bearer ")
      ? token
      : `Bearer ${token ?? ""}`;
  const lastFetchedGpPlusEmailRef = useRef<string | null>(null);
  const [resolvedIsGpPlusMember, setResolvedIsGpPlusMember] = useState<
    boolean | undefined
  >(undefined);
  const normalizedUser = useMemo(
    () =>
      user
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
        : user,
    [user]
  );
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
    if (status !== "authenticated") {
      lastFetchedGpPlusEmailRef.current = null;
      return;
    }
    if (!token) return;

    const userEmail =
      typeof normalizedUser?.email === "string"
        ? normalizedUser.email.toLowerCase()
        : "";
    if (!userEmail) return;

    const cachedEmail = (
      window.sessionStorage.getItem(GP_PLUS_EMAIL_STORAGE_KEY) || ""
    ).toLowerCase();
    const cachedStatus = window.sessionStorage.getItem(GP_PLUS_STATUS_STORAGE_KEY);
    const hasCachedStatusForUser =
      cachedEmail === userEmail &&
      (cachedStatus === "true" || cachedStatus === "false");
    if (hasCachedStatusForUser) return;

    if (lastFetchedGpPlusEmailRef.current === userEmail) return;
    lastFetchedGpPlusEmailRef.current = userEmail;

    let isCancelled = false;
    const fetchGpPlusStatus = async () => {
      if (!gpPlusStatusInFlight) {
        gpPlusStatusInFlight = axios
          .get<{ isGpPlusMember?: boolean }>("/api/get-user-account-data", {
            headers: {
              Authorization: authorizationHeader,
            },
          })
          .then(({ data }) => {
            if (typeof data?.isGpPlusMember !== "boolean") {
              return null;
            }
            return { email: userEmail, isGpPlusMember: data.isGpPlusMember };
          })
          .catch(() => null)
          .finally(() => {
            gpPlusStatusInFlight = null;
          });
      }

      const result = await gpPlusStatusInFlight;
      if (isCancelled || !result) return;
      if (result.email !== userEmail) return;

      window.sessionStorage.setItem(
        GP_PLUS_STATUS_STORAGE_KEY,
        String(result.isGpPlusMember)
      );
      window.sessionStorage.setItem(GP_PLUS_EMAIL_STORAGE_KEY, userEmail);
      document.cookie = `isGpPlusMember=${String(
        result.isGpPlusMember
      )}; path=/; SameSite=Lax`;
      setResolvedIsGpPlusMember(result.isGpPlusMember);
    };

    fetchGpPlusStatus();

    return () => {
      isCancelled = true;
    };
  }, [
    normalizedUser?.email,
    status,
    authorizationHeader,
    token,
  ]);

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

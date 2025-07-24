import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { IUserSession } from "../types/global";
import { useCustomCookies } from "./useCustomCookies";

const useSiteSession = () => {
  const session = useSession();
  useEffect(() => {
    console.log("session, yo there: ", session);
  })
  const { data, status } = session ?? {};
  const { user, token } = (data ?? {}) as IUserSession;
  const { clearCookies } = useCustomCookies();

  const logUserOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    clearCookies();
    signOut();
  };

  return {
    user,
    token,
    status,
    logUserOut,
    session: data,
  };
};

export default useSiteSession;

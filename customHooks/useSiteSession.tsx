import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { IUserSession } from "../types/global";
import { useCustomCookies } from "./useCustomCookies";

const useSiteSession = () => {
  const { data, status } = useSession();
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

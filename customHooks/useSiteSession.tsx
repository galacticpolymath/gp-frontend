import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { IUserSession } from "../types/global";

const useSiteSession = () => {
  const { data, status } = useSession();
  const { user, token } = (data ?? {}) as IUserSession;

  return {
    user,
    token,
    status,
    session: data,
  };
};

export default useSiteSession;

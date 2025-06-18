/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable semi */
/* eslint-disable indent */
import Layout from "../components/Layout";
import { createObj } from "../globalFns";
import { Cookies } from "../globalClasses";
import { useCustomCookies } from "../customHooks/useCustomCookies";
import { useEffect } from "react";
import useSiteSession from "../customHooks/useSiteSession";

const getAccessTokenObjFromUrl = (url: string) => {
  const tokenInfoStr = url.split("#").at(-1);
  let tokenAttributes: string | string[][] | string[] | undefined =
    tokenInfoStr?.split("&");
  console.log("tokenAttributes, sup there: ", tokenAttributes);
  tokenAttributes = tokenAttributes
    ? tokenAttributes.map((tokenAttribute) => tokenAttribute.split("="))
    : undefined;

  if (!tokenAttributes) {
    return null;
  }

  return createObj(tokenAttributes) as Record<string, string>;
};

const GoogleDriveAuthResult = () => {
  const { status } = useSiteSession();
  const { setCookie } = useCustomCookies(["gdriveAccessToken", "token"]);

  useEffect(() => {
    console.log("yo there useEffect");
    if (status === "authenticated") {
      const accessTokenObj = getAccessTokenObjFromUrl(window.location.href);

      console.log("accessTokenObj: ", accessTokenObj);

      if (accessTokenObj?.expires_in) {
        const expiresIn =
          new Date().getTime() + parseInt(accessTokenObj.expires_in) * 1_000;

        Object.entries(accessTokenObj).forEach(([key, val]) => {
          console.log("hey there! setting cookies.");
          const _key = key === "access_token" ? "gdriveAccessToken" : key;
          console.log("yo there key: ", _key);

          setCookie(_key, val, {
            expires: new Date(expiresIn),
          });
        });
      }
    }
  }, [status]);

  return (
    <Layout>
      <div className="min-vh-100 pt-3 ps-3">
        <span>GP now has access to your google drive!</span>
      </div>
    </Layout>
  );
};

export default GoogleDriveAuthResult;

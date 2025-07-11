/* eslint-disable indent */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import { NextResponse } from "next/server";
import {
  getAuthorizeReqResult,
  getChunks,
  verifyJwt,
} from "./nondependencyFns";
import { PASSWORD_RESET_CODE_VAR_NAME } from "./globalVars";

const DB_ADMIN_ROUTES = [
  "/api/insert-lesson",
  "/api/delete-lesson",
  "/api/update-lessons",
  "/api/delete-unit",
  "/api/update-unit",
  "/api/insert-unit",
  "/api/get-users",
  "/api/admin/migrate-to-v2-users",
  "/api/admin/insert-users",
  "/api/admin/delete-users",
];
const DB_ADMIN_ROUTES_SET = new Set(DB_ADMIN_ROUTES);
const USER_ACCOUNT_ROUTES = [
  "/api/save-about-user-form",
  "/api/copy-files",
  "/api/update-user",
  "/api/get-user-account-data",
  "/api/delete-user",
  "/api/user-confirms-mailing-list-sub",
  "/api/get-signed-in-user-brevo-status",
];

const getUnitNum = (pathName) =>
  parseInt(
    pathName
      .split("/")
      .find(
        (val) =>
          !Number.isNaN(parseInt(val)) && typeof parseInt(val) === "number"
      )
  );
const UNITS_PATH_NAME = "units";

export async function middleware(request) {
  try {
    const { nextUrl, method, headers } = request;
    /**
     * @type {{ pathname: string, search: string }}
     */
    let { pathname, search } = nextUrl;

    if (pathname === "/password-reset") {
      search = search.replace("?", "");
      const searchPathnamesSplitted = search.split("=");
      const searchPathnamesChunks = getChunks(searchPathnamesSplitted, 2);
      const isPasswordResetTokenPresent = searchPathnamesChunks.find(
        ([urlVarName, token]) => {
          return urlVarName === PASSWORD_RESET_CODE_VAR_NAME && token;
        }
      );

      return isPasswordResetTokenPresent
        ? NextResponse.next()
        : NextResponse.redirect(`${nextUrl.origin}/`);
    }

    if (!headers) {
      return new NextResponse("No headers were present in the request.", {
        status: 400,
      });
    }

    console.log(`middleware: headers are present, so we are allowing the request to continue...`);

    if (
      !nextUrl.href.includes("api") &&
      nextUrl.pathname.includes(UNITS_PATH_NAME) &&
      nextUrl?.pathname?.split("/")?.filter((val) => val)?.length == 2 &&
      Number.isInteger(getUnitNum(nextUrl.pathname))
    ) {
      console.log(`middleware: /units route was detected, so we are redirecting to /units/[unitNum]`);
      const unitNum = getUnitNum(nextUrl.pathname);
      const url = new URL(`${nextUrl.origin}/api/get-lessons`);
      const getUnitsUrl = new URL(`${nextUrl.origin}/api/get-units`);

      getUnitsUrl.searchParams.set(
        "projectionObj",
        JSON.stringify({ locale: 1, DefaultLocale: 1 })
      );

      getUnitsUrl.searchParams.set(
        "filterObj",
        JSON.stringify({ numID: [unitNum] })
      );

      url.searchParams.set(
        "projectionObj",
        JSON.stringify({ DefaultLocale: 1 })
      );
      url.searchParams.set("filterObj", JSON.stringify({ numID: [unitNum] }));

      const getUnitsRes = await fetch(url);
      const { msg, lessons } = (await getUnitsRes.json()) ?? {};
      const locale = lessons?.[0]?.DefaultLocale;
      const getCurrentUnitsRes = await fetch(getUnitsUrl);
      const { msg: errMsg, lessons: units } =
        (await getCurrentUnitsRes.json()) ?? {};
      const unitLocale = units?.[0]?.DefaultLocale;

      if (units && !unitLocale) {
        console.error(
          "Failed to retrieve the units from the db. Reason: ",
          errMsg
        );
        return NextResponse.redirect(`${nextUrl.origin}/error`);
      } else if (units && unitLocale) {
        return NextResponse.redirect(
          `${nextUrl.origin}/${UNITS_PATH_NAME}/${unitLocale}/${unitNum}`
        );
      }

      if (
        !Array.isArray(lessons) ||
        !lessons?.length ||
        lessons.some(
          (unit) => unit === null || (unit !== null && typeof unit !== "object")
        ) ||
        !locale
      ) {
        console.error(
          "Failed to retrieve the lessons from the db. Reason: ",
          msg
        );

        return NextResponse.redirect(`${nextUrl.origin}/error`);
      }

      console.log("redirecting the user to the units page...");
      return NextResponse.redirect(
        `${nextUrl.origin}/${UNITS_PATH_NAME}/${locale}/${unitNum}`
      );
    } else if (
      // unit with a locale value is present in the url
      !nextUrl.href.includes("api") &&
      nextUrl.pathname.includes(UNITS_PATH_NAME) &&
      nextUrl?.pathname?.split("/")?.filter((val) => val)?.length == 3 &&
      Number.isInteger(getUnitNum(nextUrl.pathname))
    ) {
      // checking if the unit exist
      const receivedLocale = nextUrl.pathname.split("/").at(-2);
      const unitNum = getUnitNum(nextUrl.pathname);
      const url = new URL(`${nextUrl.origin}/api/get-lessons`);

      url.searchParams.set(
        "projectionObj",
        JSON.stringify({ locale: 1, DefaultLocale: 1 })
      );

      url.searchParams.set("filterObj", JSON.stringify({ numID: [unitNum] }));

      const getUnitsUrl = new URL(`${nextUrl.origin}/api/get-units`);
      getUnitsUrl.searchParams.set(
        "projectionObj",
        JSON.stringify({ locale: 1, DefaultLocale: 1 })
      );

      getUnitsUrl.searchParams.set(
        "filterObj",
        JSON.stringify({ numID: [unitNum] })
      );

      const getLessonsRes = await fetch(url);
      const { msg, lessons } = (await getLessonsRes.json()) ?? {};
      const getUnitsRes = await fetch(getUnitsUrl);
      const { msg: errMsgUnitsRetrieval, units } =
        (await getUnitsRes.json()) ?? {};

      if (
        (msg || !lessons?.length) &&
        (!units?.length || errMsgUnitsRetrieval)
      ) {
        console.log(
          !lessons?.length
            ? "The unit does not exist."
            : `Couldn't get the units. Reason: ${msg}`
        );

        return NextResponse.redirect(`${nextUrl.origin}/error`);
      }

      let targetUnit = units.find(
        ({ numID, locale }) => locale === receivedLocale && numID == unitNum
      );

      if (!targetUnit) {
        targetUnit = lessons.find(
          ({ numID, locale }) => locale === receivedLocale && numID == unitNum
        );
      }

      if (targetUnit) {
        console.log("Unit exists with the given locale.");
        return NextResponse.next();
      }

      console.log("The unit does not exist. Will use the default locale.");
      const defaultUnit = units?.length ? units[0] : lessons[0];

      return NextResponse.redirect(
        `${nextUrl.origin}/${UNITS_PATH_NAME}/${defaultUnit.DefaultLocale}/${unitNum}`
      );
    } else if (
      !nextUrl.href.includes("api") &&
      nextUrl.pathname.includes(UNITS_PATH_NAME)
    ) {
      console.log("Not on a specific unit.");

      return NextResponse.next();
    }

    const authorizationStr = headers.get("authorization");
    const isGettingJwtToken =
      nextUrl.pathname == "/api/get-jwt-token" && method === "POST";
    let email = null;

    if (isGettingJwtToken) {
      const reqData = await request.json();
      email = reqData?.email;
    }

    if (isGettingJwtToken && (!email || typeof email !== "string")) {
      return new NextResponse(
        "Email was either not provided or its value was a invalid data type. Must be a string.",
        { status: 400 }
      );
    }

    if (isGettingJwtToken) {
      return NextResponse.next();
    }

    if (!authorizationStr) {
      console.log("No auth string was provided.");
      return new NextResponse("No authorization header was provided.", {
        status: 400,
      });
    }

    const token = authorizationStr.split(" ")[1].trim();
    console.log("Token has been extracted and is ready for verification.");
    const payload = await verifyJwt(token);

    if (
      payload?.payload?.accessibleRoutes?.length &&
      !payload.payload.accessibleRoutes.includes(nextUrl.pathname)
    ) {
      console.error("The client does not have access to this route.");

      return new NextResponse("Unauthorized.", { status: 401 });
    }

    if (!nextUrl.pathname) {
      return new NextResponse("No pathName was provided.", { status: 400 });
    }

    if (
      nextUrl.pathname === "/api/update-password" &&
      method === "POST" &&
      authorizationStr
    ) {
      const authResult = await getAuthorizeReqResult(authorizationStr);

      if (authResult.errResponse) {
        return authResult.errResponse;
      }

      return NextResponse.next();
    }

    if (
      nextUrl.pathname === "/api/copy-files" &&
      method === "POST" &&
      headers.has("GDrive-Token")
    ) {
      console.log("will check if the auth string is valid.");
      const { errResponse } = await getAuthorizeReqResult(
        authorizationStr,
        false
      );

      if (errResponse) {
        return errResponse;
      }

      console.log("The GDrive-Token was provided.");

      return NextResponse.next();
    } else if (nextUrl.pathname === "/api/copy-files" && method === "POST") {
      return new NextResponse("No GDrive-Token was provided.", { status: 400 });
    }

    if (
      (nextUrl.pathname == "/api/update-lessons" &&
        method === "PUT" &&
        authorizationStr) ||
      (nextUrl.pathname == "/api/admin/delete-users" &&
        method === "DELETE" &&
        authorizationStr) ||
      (nextUrl.pathname == "/api/admin/insert-users" &&
        method === "POST" &&
        authorizationStr) ||
      (nextUrl.pathname == "/api/admin/migrate-to-v2-users" &&
        method === "PUT" &&
        authorizationStr) ||
      (nextUrl.pathname == "/api/insert-lesson" &&
        method === "POST" &&
        authorizationStr) ||
      (nextUrl.pathname == "/api/insert-unit" &&
        method === "POST" &&
        authorizationStr) ||
      (nextUrl.pathname == "/api/update-unit" &&
        method === "PUT" &&
        authorizationStr) ||
      (nextUrl.pathname == "/api/delete-lesson" &&
        method === "DELETE" &&
        authorizationStr) ||
      (nextUrl.pathname == "/api/delete-unit" &&
        method === "DELETE" &&
        authorizationStr) ||
      (nextUrl.pathname == "/api/delete-user" &&
        method === "DELETE" &&
        authorizationStr) ||
      (nextUrl.pathname == "/api/save-about-user-form" &&
        method === "PUT" &&
        authorizationStr) ||
      (nextUrl.pathname == "/api/update-user" &&
        method === "PUT" &&
        authorizationStr) ||
      (nextUrl.pathname == "/api/user-confirms-mailing-list-sub" &&
        method === "PUT" &&
        authorizationStr) ||
      (nextUrl.pathname == "/api/get-users" &&
        method === "GET" &&
        authorizationStr) ||
      (nextUrl.pathname == "/api/get-signed-in-user-brevo-status" &&
        method === "GET" &&
        authorizationStr) ||
      (nextUrl.pathname == "/api/get-user-account-data" &&
        method === "GET" &&
        authorizationStr)
    ) {
      const willCheckIfUserIsDbAdmin = DB_ADMIN_ROUTES_SET.has(
        nextUrl.pathname
      );
      const { isAuthorize, errResponse } = await getAuthorizeReqResult(
        authorizationStr,
        willCheckIfUserIsDbAdmin
      );

      return isAuthorize ? NextResponse.next() : errResponse
    }

    console.error("Invalid request path. Retrieved: ", nextUrl.pathname);

    return new NextResponse("Invalid request parameters, body, or method.", {
      status: 400,
    });
  } catch (error) {
    const errMsg = `An error has occurred in the middleware: ${error}`;

    console.error("Middleware errror: ", errMsg);

    if (
      (typeof request?.nextUrl === "string" &&
        !request?.nextUrl?.includes("api")) ||
      (typeof request?.nextUrl?.href === "string" &&
        request.nextUrl.href.includes("api"))
    ) {
      return NextResponse.redirect(`${request.nextUrl.origin}/error`);
    }

    return new NextResponse(errMsg, { status: 400 });
  }
}

export const config = {
  matcher: [
    "/api/insert-lesson",
    "/api/delete-lesson/:id",
    "/api/update-lessons",
    "/api/save-about-user-form",
    "/api/get-jwt-token",
    "/api/get-about-user-form",
    "/api/update-password",
    "/password-reset",
    "/units/:path*",
    "/api/delete-user",
    "/api/get-user-account-data",
    "/api/update-user",
    "/api/user-confirms-mailing-list-sub",
    "/api/get-users",
    "/api/insert-unit",
    "/api/copy-files",
    "/api/get-signed-in-user-brevo-status",
    "/api/delete-unit",
    "/api/update-unit",
    "/api/admin/migrate-to-v2-users",
    "/api/admin/insert-users",
    "/api/admin/delete-users",
  ],
};

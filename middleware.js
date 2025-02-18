/* eslint-disable indent */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import { NextResponse } from "next/server";
import { getAuthorizeReqResult, getChunks, verifyJwt } from "./nondependencyFns";
import { PASSWORD_RESET_TOKEN_VAR_NAME } from "./globalVars";

const DB_ADMIN_ROUTES = [
  "/api/insert-lesson",
  "/api/delete-lesson",
  "/api/update-lessons",
  "/api/get-users",
];
const USER_ACCOUNT_ROUTES = [
  "/api/save-about-user-form",
  "/api/update-user",
  "/api/get-user-account-data",
  "/api/delete-user",
  "/api/user-confirms-mailing-list-sub",
  "/api/get-signed-in-user-brevo-status"
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
          return urlVarName === PASSWORD_RESET_TOKEN_VAR_NAME && token;
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

    if (
      !nextUrl.href.includes("api") &&
      nextUrl.pathname.includes("lessons") &&
      nextUrl?.pathname?.split("/")?.filter((val) => val)?.length == 2 &&
      Number.isInteger(getUnitNum(nextUrl.pathname))
    ) {
      // put this into a service
      const unitNum = getUnitNum(nextUrl.pathname);
      const url = new URL(`${nextUrl.origin}/api/get-lessons`);

      url.searchParams.set(
        "projectionObj",
        JSON.stringify({ DefaultLocale: 1 })
      );
      url.searchParams.set("filterObj", JSON.stringify({ numID: [unitNum] }));

      const getUnitsRes = await fetch(url);
      const { msg, lessons } = (await getUnitsRes.json()) ?? {};
      const locale = lessons?.[0]?.DefaultLocale;

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
        `${nextUrl.origin}/lessons/${locale}/${unitNum}`
      );
    } else if (
      // unit with a locale value is present in the url
      !nextUrl.href.includes("api") &&
      nextUrl.pathname.includes("lessons") &&
      nextUrl?.pathname?.split("/")?.filter((val) => val)?.length == 3 &&
      Number.isInteger(getUnitNum(nextUrl.pathname))
    ) {
      const receivedLocale = nextUrl.pathname.split("/").at(-2);
      const unitNum = getUnitNum(nextUrl.pathname);
      const url = new URL(`${nextUrl.origin}/api/get-lessons`);

      url.searchParams.set(
        "projectionObj",
        JSON.stringify({ locale: 1, DefaultLocale: 1 })
      );
      url.searchParams.set("filterObj", JSON.stringify({ numID: [unitNum] }));

      const getUnitsRes = await fetch(url);
      const { msg, lessons } = (await getUnitsRes.json()) ?? {};

      if (msg || !lessons?.length) {
        console.log(
          !lessons?.length
            ? "The unit does not exist."
            : `Couldn't get the units. Reason: ${msg}`
        );

        return NextResponse.redirect(`${nextUrl.origin}/error`);
      }

      const targetLesson = lessons.find(
        ({ numID, locale }) => locale === receivedLocale && numID == unitNum
      );

      if (targetLesson) {
        console.log("The unit does exist.");
        return NextResponse.next();
      }

      console.log("The unit does not exist.");

      return NextResponse.redirect(
        `${nextUrl.origin}/lessons/${lessons[0].DefaultLocale}/${unitNum}`
      );
    } else if (
      !nextUrl.href.includes("api") &&
      nextUrl.pathname.includes("lessons")
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

    const token = authorizationStr.split(' ')[1].trim();
    console.log("token length before trim: ", token.length)
    console.log("yo there token: ", token)
    console.log("token length after trim: ", token.trim().length)
    const payload = await verifyJwt(token);

    // print the payload
    console.log("payload sup there: ", payload);

    if (payload?.payload?.accessibleRoutes?.length && !payload.payload.accessibleRoutes.includes(nextUrl.pathname)) {
      console.error("The client does not have access to this route.");

      return new NextResponse("Unauthorized.", { status: 401 })
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

    // put this into an array and search via the pathname field
    if (
      (nextUrl.pathname == "/api/update-lessons" &&
        method === "PUT" &&
        authorizationStr) ||
      (nextUrl.pathname == "/api/insert-lesson" &&
        method === "POST" &&
        authorizationStr) ||
      (nextUrl.pathname == "/api/delete-lesson" &&
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
      const willCheckIfUserIsDbAdmin = DB_ADMIN_ROUTES.includes(
        nextUrl.pathname
      );
      const willCheckForValidEmail = USER_ACCOUNT_ROUTES.includes(
        nextUrl.pathname
      );
      let clientEmail = null;

      const body =
        nextUrl.pathname === "/api/save-about-user-form" && method === "PUT"
          ? await request.json()
          : null;

      if (
        nextUrl.pathname === "/api/save-about-user-form" &&
        typeof body?.userEmail === "string"
      ) {
        clientEmail = body.userEmail;
      } else if (nextUrl.pathname === "/api/save-about-user-form") {
        throw new Error(
          "Received invalid parameters for the retreival of the user's 'About Me' form."
        );
      }

      if (
        ["/api/save-about-user-form"].includes(
          nextUrl.pathname
        )
      ) {
        const { isAuthorize, errResponse } = await getAuthorizeReqResult(
          authorizationStr,
          willCheckIfUserIsDbAdmin,
          willCheckForValidEmail,
          clientEmail,
        );

        return isAuthorize ? errResponse : NextResponse.next();
      }

      const { isAuthorize, errResponse } = await getAuthorizeReqResult(
        authorizationStr,
        willCheckIfUserIsDbAdmin
      );

      console.log("willCheckIfUserIsDbAdmin: ", willCheckIfUserIsDbAdmin);
      console.log("isAuthorize: ", isAuthorize);

      return isAuthorize ? errResponse : NextResponse.next();
    }

    return new NextResponse("Invalid request parameters, body, or method.", {
      status: 400,
    });
  } catch (error) {
    const errMsg = `An error has occurred in the middleware: ${error}`;

    console.error("Middleware errror: ", errMsg)

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
    "/lessons/:path*",
    "/api/delete-user",
    "/api/get-user-account-data",
    "/api/update-user",
    "/api/user-confirms-mailing-list-sub",
    "/api/get-users",
    "/api/get-signed-in-user-brevo-status"
  ],
};

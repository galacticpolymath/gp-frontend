/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { AuthMiddlwareError } from './backend/utils/errors';

const DB_ADMIN_ROUTES = ['/api/insert-lesson', '/api/delete-lesson', '/api/update-lessons'];
const USER_ACCOUNT_ROUTES = ['/api/get-about-user-form', '/api/save-about-user-form'];

const getDoesUserHaveSpecifiedRole = (userRoles, targetRole = 'user') => !!userRoles.find(role => role === targetRole);

/**
 * @param {string} authorizationStr 
 * @param {boolean} willCheckIfUserIsDbAdmin 
 * @param {boolean} willCheckForValidEmail 
 * @param {string} emailToValidate 
 * @returns
 */
const getAuthorizeReqResult = async (
  authorizationStr,
  willCheckIfUserIsDbAdmin,
  willCheckForValidEmail,
  emailToValidate
) => {
  try {
    const token = authorizationStr.split(' ')[1].trim();
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.NEXTAUTH_SECRET));

    if (!payload) {
      const errMsg = 'You are not authorized to access this service.';
      const response = new NextResponse(errMsg, { status: 403 });

      throw new AuthMiddlwareError(false, response, errMsg);
    }

    if (willCheckIfUserIsDbAdmin && !getDoesUserHaveSpecifiedRole(payload.roles, 'dbAdmin')) {
      const errMsg = 'You are not authorized to access this service.';
      const response = new NextResponse(errMsg, { status: 403 });

      throw new AuthMiddlwareError(false, response, errMsg);
    }

    if (willCheckForValidEmail && (payload.email !== emailToValidate)) {
      const errMsg = 'You are not authorized to access this service.';
      const response = new NextResponse(errMsg, { status: 403 });

      throw new AuthMiddlwareError(false, response, errMsg);
    }

    return { isAuthorize: true };
  } catch (error) {
    const { errResponse, msg } = error ?? {};

    console.error('Error message: ', msg ?? 'Failed to validate jwt.');

    return { isAuthorize: false, errResponse, msg };
  }
};

const getUnitNum = pathName => parseInt(pathName.split('/').find(val => !Number.isNaN(parseInt(val)) && (typeof parseInt(val) === 'number')));

export async function middleware(request) {
  try {
    const { nextUrl, method, headers } = request;

    if (!headers) {
      return new NextResponse('No headers were present in the request.', { status: 400 });
    }

    // if the user is taken to the reset-password path, and there is no token, then take the user back to the home page

    if (
      !nextUrl.href.includes('api') &&
      nextUrl.pathname.includes('lessons') &&
      (nextUrl?.pathname?.split('/')?.filter(val => val)?.length == 2) &&
      Number.isInteger(getUnitNum(nextUrl.pathname))
    ) {
      // put this into a service
      const unitNum = getUnitNum(nextUrl.pathname);
      const url = new URL(`${nextUrl.origin}/api/get-lessons`);

      url.searchParams.set('projectionObj', JSON.stringify({ DefaultLocale: 1 }));
      url.searchParams.set('filterObj', JSON.stringify({ numID: [unitNum] }));

      const getUnitsRes = await fetch(url);
      const { msg, lessons } = await getUnitsRes.json() ?? {};
      const locale = lessons?.[0]?.DefaultLocale;

      if (!Array.isArray(lessons) || !lessons?.length || lessons.some(unit => (unit === null) || ((unit !== null) && (typeof unit !== 'object'))) || !locale) {
        console.error('Failed to retrieve the lessons from the db. Reason: ', msg);

        return NextResponse.redirect(`${nextUrl.origin}/error`);
      }

      console.log('redirecting the user to the units page...');
      return NextResponse.redirect(`${nextUrl.origin}/lessons/${locale}/${unitNum}`);
    } else if (
      // unit with a locale value is present in the url
      !nextUrl.href.includes('api') &&
      nextUrl.pathname.includes('lessons') &&
      (nextUrl?.pathname?.split('/')?.filter(val => val)?.length == 3) &&
      Number.isInteger(getUnitNum(nextUrl.pathname))
    ) {
      const receivedLocale = nextUrl.pathname.split('/').at(-2);
      const unitNum = getUnitNum(nextUrl.pathname);
      const url = new URL(`${nextUrl.origin}/api/get-lessons`);

      url.searchParams.set('projectionObj', JSON.stringify({ locale: 1, DefaultLocale: 1 }));
      url.searchParams.set('filterObj', JSON.stringify({ numID: [unitNum] }));

      const getUnitsRes = await fetch(url);
      const { msg, lessons } = await getUnitsRes.json() ?? {};

      if (msg || !lessons?.length) {
        console.log(!lessons?.length ? 'The unit does not exist.' : `Couldn't get the units. Reason: ${msg}`);

        return NextResponse.redirect(`${nextUrl.origin}/error`);
      }

      const targetLesson = lessons.find(({ numID, locale }) => (locale === receivedLocale) && numID == unitNum);

      if (targetLesson) {
        console.log('The unit does exist.');
        return NextResponse.next();
      }

      console.log('The unit does not exist.');

      return NextResponse.redirect(`${nextUrl.origin}/lessons/${lessons[0].DefaultLocale}/${unitNum}`);
    } else if (!nextUrl.href.includes('api') && nextUrl.pathname.includes('lessons')) {
      console.log('Not on a specific unit.');

      return NextResponse.next();
    }

    const authorizationStr = headers.get('authorization');
    const isGettingJwtToken = (nextUrl.pathname == '/api/get-jwt-token') && (method === 'POST');
    let email = null;

    if (isGettingJwtToken) {
      const reqData = await request.json();
      email = reqData?.email;
    }

    if (isGettingJwtToken && (!email || (typeof email !== 'string'))) {
      return new NextResponse('Email was either not provided or its value was a invalid data type. Must be a string.', { status: 400 });
    }

    if (isGettingJwtToken) {
      return NextResponse.next();
    }

    if (!authorizationStr) {
      return new NextResponse('No authorization header was provided.', { status: 400 });
    }

    if (!nextUrl.pathname) {
      return new NextResponse('No pathName was provided.', { status: 400 });
    }

    // get 

    if (
      ((nextUrl.pathname == '/api/update-lessons') && (method === 'PUT') && authorizationStr) ||
      ((nextUrl.pathname == '/api/insert-lesson') && (method === 'POST') && authorizationStr) ||
      ((nextUrl.pathname == '/api/delete-lesson') && (method === 'DELETE') && authorizationStr) ||
      ((nextUrl.pathname == '/api/get-about-user-form') && (method === 'GET') && authorizationStr) ||
      ((nextUrl.pathname == '/api/save-about-user-form') && (method === 'PUT') && authorizationStr)
    ) {
      const willCheckIfUserIsDbAdmin = DB_ADMIN_ROUTES.includes(nextUrl.pathname);
      const willCheckForValidEmail = USER_ACCOUNT_ROUTES.includes(nextUrl.pathname);
      let clientEmail = null;
      let urlParamsStr = typeof nextUrl?.search === 'string' ? nextUrl?.search.replace(/\?/g, '') : '';

      urlParamsStr = typeof nextUrl?.search === 'string' ? urlParamsStr.replace(/%40/g, '@') : '';

      if ((nextUrl.pathname === '/api/get-about-user-form') && (urlParamsStr.split('=').length == 2)) {
        clientEmail = urlParamsStr.split('=')[1];
      } else if (nextUrl.pathname === '/api/get-about-user-form') {
        throw new Error("Received invalid parameters for the retreival of the user's 'About Me' form.");
      }

      const body = ((nextUrl.pathname === '/api/save-about-user-form') && (method === 'PUT')) ? await request.json() : null;

      if ((nextUrl.pathname === '/api/save-about-user-form') && (typeof body?.userEmail === 'string')) {
        clientEmail = body.userEmail;
      } else if (nextUrl.pathname === '/api/save-about-user-form') {
        throw new Error("Received invalid parameters for the retreival of the user's 'About Me' form.");
      }

      const authorizationResult = await getAuthorizeReqResult(
        authorizationStr,
        willCheckIfUserIsDbAdmin,
        willCheckForValidEmail,
        clientEmail
      );

      if (authorizationResult) {
        return authorizationResult.errResponse;
      }

      return NextResponse.next();
    }

    return new NextResponse('Invalid request parameters, body, or method.', { status: 400 });
  } catch (error) {
    const errMsg = `An error has occurred in the middleware: ${error}`;

    console.log('errMsg, what is up: ', errMsg);

    if (((typeof request?.nextUrl === 'string') && !request?.nextUrl?.includes('api')) || ((typeof request?.nextUrl?.href === 'string') && request.nextUrl.href.includes('api'))) {
      return NextResponse.redirect(`${request.nextUrl.origin}/error`);
    }

    return new NextResponse(errMsg, { status: 400 });

  }
}

export const config = {
  matcher: [
    '/api/insert-lesson',
    '/api/delete-lesson/:id',
    '/api/update-lessons',
    '/api/save-about-user-form',
    '/api/get-jwt-token',
    '/api/get-about-user-form',
    '/lessons/:path*',
  ],
};
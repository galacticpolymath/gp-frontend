/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const getDoesUserHaveSpecifiedRole = (userRoles, targetRole = 'user') => !!userRoles.find(role => role === targetRole);

// may use this function to check for non-related admin routes
const getAuthorizeReqResult = async (authorizationStr, willCheckIfUserIsDbAdmin) => {
  const token = authorizationStr.split(' ')[1].trim();
  const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.NEXTAUTH_SECRET));

  if (!payload) {
    return {
      isAuthorize: false,
      errResponse: new NextResponse('You are not authorized to access this service.', { status: 403 }),
    };
  }

  if (willCheckIfUserIsDbAdmin && !getDoesUserHaveSpecifiedRole(payload.roles, 'dbAdmin')) {
    return {
      isAuthorize: false,
      errResponse: new NextResponse('You are not authorized to access this service.', { status: 403 }),
    };
  }

  return { isAuthorize: true };
};

const getUnitNum = pathName => parseInt(pathName.split('/').find(val => !Number.isNaN(parseInt(val)) && (typeof parseInt(val) === 'number')));

export async function middleware(request) {
  try {
    const { nextUrl, method, headers } = request;

    if (!headers) {
      return new NextResponse('No headers were present in the request.', { status: 400 });
    }

    // a selected unit without locale
    if (
      !nextUrl.href.includes('api') &&
      nextUrl.pathname.includes('lessons') &&
      (nextUrl?.pathname?.split('/')?.filter(val => val)?.length == 2) &&
      Number.isInteger(getUnitNum(nextUrl.pathname))
    ) {
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

      if (msg || !lessons.length) {
        console.log(!lessons.length ? 'The unit does not exist.' : `Couldn't get the units. Reason: ${msg}`);

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

    if (
      ((nextUrl.pathname == '/api/update-lessons') && (method === 'PUT') && authorizationStr) ||
      ((nextUrl.pathname == '/api/insert-lesson') && (method === 'POST') && authorizationStr) ||
      ((nextUrl.pathname == '/api/delete-lesson') && (method === 'DELETE') && authorizationStr) ||
      ((nextUrl.pathname == '/api/save-about-user-form') && (method === 'PUT') && authorizationStr)
    ) {
      // if the route '/api/save-about-user-form', then parse the jwt, get the email and compare it with the email 
      // -within the body of the request
      
      const { errResponse } = await getAuthorizeReqResult(authorizationStr, true);

      if (errResponse) {
        return errResponse;
      }

      return NextResponse.next();
    }

    return new NextResponse('Invalid request parameters, body, or method.', { status: 400 });
  } catch (error) {
    const errMsg = `An error has occurred in the middleware: ${error}`;

    console.error('An error has occurred in the middlware function: ', errMsg);

    if (!request.nextUrl.includes('api')) {
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
    '/lessons/:path*',
  ],
};
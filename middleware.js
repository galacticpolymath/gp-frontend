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

    // no locale in path of the url
    if (
      !nextUrl.href.includes('api') &&
      nextUrl.pathname.includes('lessons') &&
      (nextUrl?.pathname?.split('/')?.length == 3) &&
      Number.isInteger(getUnitNum(nextUrl.pathname))
    ) {
      const unitNum = getUnitNum(nextUrl.pathname);
      const url = new URL(`${nextUrl.origin}/api/get-lessons`);

      url.searchParams.set('projectionObj', JSON.stringify({ locale: 1 }));
      url.searchParams.set('filterObj', JSON.stringify({ numID: [unitNum] }));

      const getUnitsRes = await fetch(url);
      const { msg, lessons } = await getUnitsRes.json() ?? {};

      if (!Array.isArray(lessons) || !lessons?.length || lessons.some(unit => (unit === null) || ((unit !== null) && (typeof unit !== 'object')))) {
        console.error('Failed to retrieve the lessons from the db. Reason: ', msg);

        return NextResponse.redirect(`${nextUrl.origin}/error`);
      }

      const locale = lessons[0].defaultLocale ?? lessons[0].locale;

      if (!locale) {
        console.log(`The locale does not exist for lesson ${unitNum}.`);

        return NextResponse.redirect(`${nextUrl.origin}/error`);
      }

      return NextResponse.redirect(`${nextUrl.origin}/lessons/${locale}/${unitNum}`);
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
      return new NextResponse('Email was either not provided or a invalid data type. Must be a string.', { status: 400 });
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
      ((nextUrl.pathname == '/api/delete-lesson') && (method === 'DELETE') && authorizationStr)
    ) {
      const { errResponse } = await getAuthorizeReqResult(authorizationStr, true);

      if (errResponse) {
        return errResponse;
      }

      return NextResponse.next();
    }

    return new NextResponse('Invalid request parameters, body, or method.', { status: 400 });
  } catch (error) {
    const errMsg = `An error has occurred in the middleware: ${error}`;

    return new NextResponse(errMsg, { status: 400 });

  }
}

export const config = {
  matcher: [
    '/api/insert-lesson',
    '/api/delete-lesson/:id',
    '/api/update-lessons',
    '/api/get-jwt-token',
    '/lessons/:path*',
  ],
};
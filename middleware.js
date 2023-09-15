import { NextResponse } from "next/server";
import { jwtVerify } from 'jose'

const getDoesUserHaveSpecifiedRole = (userRoles, targetRole = 'user') => !!userRoles.find(role => role === targetRole);
const VALIDS_METHODS = ['POST']

// may use this function to check for non-related admin routes
const getAuthorizeReqResult = async (authorizationStr, willCheckIfUserIsDbAdmin) => {
    const token = authorizationStr.split(" ")[1].trim();
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.NEXTAUTH_SECRET));

    if (!payload) {
        return { isAuthorize: false, errResponse: new NextResponse("You are not authorized to access this service.", { status: 403 }) }
    }

    if (willCheckIfUserIsDbAdmin && !getDoesUserHaveSpecifiedRole(payload.roles, 'dbAdmin')) {
        return { isAuthorize: false, errResponse: new NextResponse("You are not authorized to access this service.", { status: 403 }) }
    }

    return { isAuthorize: true }
}


export async function middleware(request) {
    const { nextUrl, method, headers } = request;

    if (!headers) {
        return new NextResponse("No headers were present in the request.", { status: 400 })
    }

    const authorizationStr = headers.get('authorization')

    if (!authorizationStr) {
        return new NextResponse("No authorization header was provided.", { status: 400 })
    }

    if (!nextUrl.pathname) {
        return new NextResponse("No pathName was provided.", { status: 400 })
    }

    if (
        ((nextUrl.pathname == "/api/update-lessons") && (method === 'PUT') && authorizationStr) ||
        ((nextUrl.pathname == "/api/insert-lesson") && (method === 'POST') && authorizationStr)
    ) {
        const { errResponse } = await getAuthorizeReqResult(authorizationStr, true);

        if (errResponse) {
            return errResponse;
        }

        return NextResponse.next();
    }

    return new NextResponse("Invalid request parameters or body.", { status: 400 })
}

export const config = {
    matcher: ['/api/insert-lesson', '/api/delete-lesson/:id', 'api/update-lesson'],
}
import { NextResponse } from "next/server";
import { jwtVerify } from 'jose'

const getDoesUserHaveSpecifiedRole = (userRoles, targetRole = 'user') => !!userRoles.find(role => role === targetRole);
const VALIDS_METHODS = ['POST']

const authorizeReq = async (authorizationStr) => {
    const token = authorizationStr.split(" ")[1].trim();
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.NEXTAUTH_SECRET));

    if(!payload) {
        return new NextResponse("You are not authorized to access this service.", { status: 403 })
    }
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

    if ((nextUrl.pathname == "/api/update-lessons") && (method === 'PUT') && authorizationStr) {

    }


    // check fo the following in the request: 
    // if the payload is present in the request
    // if the user is a dbAdmin 

    if ((nextUrl.pathname == "/api/insert-lesson") && (method === 'POST') && authorizationStr) {
        const token = authorizationStr.split(" ")[1].trim();
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.NEXTAUTH_SECRET));

        if (!payload) {
            return new NextResponse("You are not authorized to access this service.", { status: 403 })
        }

        const isUserDbAdmin = getDoesUserHaveSpecifiedRole(payload.roles, 'dbAdmin');

        if (!isUserDbAdmin) {
            return new NextResponse("You are not authorized to access this service.", { status: 403 })
        }

        return NextResponse.next();
    }

    return new NextResponse("Invalid request parameters or body.", { status: 400 })
}

export const config = {
    matcher: ['/api/insert-lesson', '/api/delete-lesson/:id', 'api/update-lesson'],
}
import { NextResponse } from "next/server";
import { jwtVerify } from 'jose'

const getDoesUserHaveSpecifiedRole = (userRoles, targetRole = 'user') => !!userRoles.find(role => role === targetRole);
const VALIDS_METHODS = ['POST']


export async function middleware(request) {
    const { nextUrl, method, headers } = request;
    const authorizationStr = headers.get('authorization')

    if(!nextUrl.pathname){
        return new NextResponse("No pathName was provided.", { status: 400 })
    }

    if(!authorizationStr){
        return new NextResponse("No authorization header was provided.", { status: 400 })
    }

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
    matcher: ['/api/insert-lesson', '/api/delete-lesson/:id'],
}
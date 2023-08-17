import { NextResponse } from "next/server";
import { jwtVerify } from 'jose'


const getTokenPayload = async token => {
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.NEXTAUTH_SECRET));
        
        return payload;
    } catch(error){
        console.error('An error has occurred in validating jwt. Error message: ', error)

        return null;
    }
}

const getDoesUserHaveSpecifiedRole = (userRoles, targetRole = 'user') => !!userRoles.find(role => role === targetRole);

export async function middleware(request) {
    const { nextUrl, method, headers } = request;
    const authorizationStr = headers.get('authorization')

    if ((nextUrl.pathname == "/api/insert-lesson") && (method !== 'POST')) {
        return new NextResponse(`Cannot access this endpoint with '${method}'`, { status: 400 })
    }

    if ((nextUrl.pathname == "/api/insert-lesson") && (method !== 'POST') && !authorizationStr) {
        return new NextResponse("You cannot access this endpoint. 'authorization' field is not present in the headers", { status: 401 })
    }

    if ((nextUrl.pathname == "/api/insert-lesson") && (method === 'POST') && authorizationStr) {
        const token = authorizationStr.split(" ")[1].trim();
        const payload = await getTokenPayload(token);
        console.log('payload: ', payload)
        const isUserDbAdmin = getDoesUserHaveSpecifiedRole(payload.roles, 'dbAdmin');
        console.log('isUserDbAdmin: ', isUserDbAdmin)
        
        if (!isUserDbAdmin) {
            return new NextResponse("You are not authorized to access this service.", { status: 403 })
        }

        return NextResponse.next();
    }

    return new NextResponse("Invalid request parameters or body.", { status: 404 })
}

export const config = {
    matcher: ['/api/insert-lesson', '/api/delete-lesson/:id'],
  }
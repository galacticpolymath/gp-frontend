import { NextResponse } from "next/server";
import { jwtVerify } from 'jose'

export const getTokenVerificationResult = async token => {
    try {

        const { payload } = await jwtVerify(token, process.env.NEXTAUTH_SECRET);

        console.log('payload: ', payload)
        // run some checks on the returned payload, perhaps you expect some specific values
        
        // if its all good, return it, or perhaps just return a boolean
        return { wasSuccessful: true, userCredentials: payload };
    } catch(error){

        return { wasSuccessful: false, msg: `An error has occurred in validating jwt. Error message: ${error}.` };
    }
}

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
        console.log('token: ', token)
        const result = await getTokenVerificationResult(token);

        console.log('result: ', result)

        // const authorizationResult = await getIsReqAuthorizedResult(request, 'dbAdmin');

        // if (!authorizationResult?.isReqAuthorized) {
        //     return new NextResponse("You are not authorized to access this service.", { status: 403 })
        // }

        // if (!Object.keys(request?.body)?.length) {
        // }
        return new NextResponse("The request body is empty.", { status: 400 })

        // return NextResponse.next();
    }

    return new NextResponse("Invalid request parameters or body.", { status: 404 })
}

export const config = {
    matcher: ['/api/insert-lesson', '/api/delete-lesson/:id'],
  }
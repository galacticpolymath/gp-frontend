import { NextResponse } from "next/server";
import { getIsReqAuthorizedResult } from "./backend/services/authServices";

export async function middleware(request) {
    const { nextUrl, method, headers } = request;

    if ((nextUrl.pathname == "/api/insert-lesson") && (method !== 'POST')) {
        return new NextResponse(`Cannot access this endpoint with '${method}'`, { status: 400 })
    }

    if ((nextUrl.pathname == "/api/insert-lesson") && (method !== 'POST') && !headers.authorization) {
        return new NextResponse("You cannot access this endpoint. 'authorization' field is not present in the headers", { status: 401 })
    }

    if ((nextUrl.pathname == "/api/insert-lesson") && (method === 'POST') && headers.authorization) {
        const authorizationResult = await getIsReqAuthorizedResult(request, 'dbAdmin');

        if (!authorizationResult?.isReqAuthorized) {
            return new NextResponse("You are not authorized to access this service.", { status: 403 })
        }

        if (!Object.keys(request?.body)?.length) {
            return new NextResponse("The request body is empty.", { status: 400 })
        }

        return NextResponse.next();
    }

    return new NextResponse("Invalid request parameters or body.", { status: 404 })
}

export const config = {
    matcher: ['/api/insert-lesson', '/api/delete-lesson/:id'],
  }
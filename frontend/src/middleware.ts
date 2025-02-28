import { NextRequest, NextResponse } from "next/server"
import { TOKEN_COOKIE_NAME } from "./app/_lib/config";

export function middleware(request: NextRequest) {
    const token = request.cookies.get(TOKEN_COOKIE_NAME);
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  
    if (!token && !isAuthPage) {
      const url = new URL('/login', request.url);
      url.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next()
}
export const config = {
  matcher: [
    "/projects/:path",
    "/login",
    "/singup"
  ],
}
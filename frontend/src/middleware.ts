import { NextRequest, NextResponse } from "next/server"
import { TOKEN_COOKIE_NAME } from "./app/_lib/config";
import { getCurrentUser } from "./app/_actions/auth";
import { User } from "./app/_lib/types";

const privateRoutes = [
  /\/settings\/profile/,
  /\/projects\/new/,
  /\/projects\/[0-9]+/,
  /\/settings/
]

export async function middleware(request: NextRequest) {
    const token = request.cookies.get(TOKEN_COOKIE_NAME);
    const path = request.nextUrl.pathname
    const userResult: {user: User}|null = (await getCurrentUser())
    const isAuthPage = path.match(/^(\/login|\/signup)$/);
    const isPrivate = privateRoutes.some((entry)=>path.match(entry))

    if (isAuthPage && token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if(path.match(/\/admin\/(?:(?!login)[a-zA-Z0-9_])(?:[\w\/]*)/)){
      if(!userResult?.["user"]){
        const url = new URL('/admin/login', request.url);
        url.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
      if(userResult?.["user"].role === "user"){
        const url = new URL('/login', request.url);
        url.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
      if(userResult?.["user"].role === "reviewer"){
        const url = new URL('/reviewer/login', request.url);
        url.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
    }

    if(path.match(/\/expert\/(?:(?!login)[a-zA-Z0-9_])(?:[\w\/]*)/)){
      if(!userResult?.["user"]){
        const url = new URL('/expert/login', request.url);
        url.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
      if(userResult?.["user"].role === "user"){
        const url = new URL('/login', request.url);
        url.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
      if(userResult?.["user"].role === "admin"){
        const url = new URL('/admin/login', request.url);
        url.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
      if(userResult?.["user"].role === "reviewer"){
        const url = new URL('/reviewer/login', request.url);
        url.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
    }

    if(path.match(/\/reviewer\/(?:(?!login)[a-zA-Z0-9_])(?:[\w\/]*)/)){
      if(!userResult?.["user"]){
        const url = new URL('/reviewer/login', request.url);
        url.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
      if(userResult?.["user"].role === "user"){
        const url = new URL('/login', request.url);
        url.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
      if(userResult?.["user"].role === "admin"){
        const url = new URL('/admin/login', request.url);
        url.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
    }

    if (!token && !isAuthPage && isPrivate && path !== "/") {
      const url = new URL('/login', request.url);
      url.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next()
}
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
  ],
}
import { NextResponse, type NextRequest } from "next/server"

// Runs before every page request. It copies the requested path into a header,
// so the protected layout can send the user back there after signing in.
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers)
  headers.set("x-pathname", request.nextUrl.pathname + request.nextUrl.search)
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
}

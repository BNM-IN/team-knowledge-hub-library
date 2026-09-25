import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, USE_MOCKS } from "@/lib/config";
import { safeNext } from "@/lib/safe-next";

/**
 * FR-AUTH-03: every page except the landing page, sign-in and shared-note previews needs a signed-in user.
 * Signed-out visitors are sent to Google via /signin and returned to where they were going.
 */
function needsAuth(path: string) {
  if (path === "/" || path === "/signin" || path.startsWith("/auth/")) return false;
  // /notes/<id> renders its own signed-out gate (S1 · B1/B4); /notes, /notes/new and edit pages need auth.
  if (/^\/notes\/(?!new$)[^/]+$/.test(path)) return false;
  return true;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  let response = NextResponse.next({ request });
  let signedIn: boolean;

  if (USE_MOCKS) {
    signedIn = request.cookies.get(DEMO_COOKIE)?.value === "1";
  } else {
    // Refresh the Supabase session cookie on every request (FR-AUTH-04).
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    const { data } = await supabase.auth.getUser();
    signedIn = !!data.user;
  }

  if (!signedIn && needsAuth(path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.search = `?next=${encodeURIComponent(path + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  if (signedIn && path === "/signin") {
    return NextResponse.redirect(new URL(safeNext(request.nextUrl.searchParams.get("next")), request.url));
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Refresh the Supabase auth session (handles cookie refresh)
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Public routes — no auth needed
  if (pathname === "/admin" || pathname === "/admin/login") {
    return response;
  }

  // Only protect /admin/* routes
  if (!pathname.startsWith("/admin")) {
    return response;
  }

  // Check if user is authenticated using cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

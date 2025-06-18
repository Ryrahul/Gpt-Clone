import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/chat(.*)", "/api/chat"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (isProtectedRoute(req) && !userId) {
    // Redirect to sign-in for protected routes
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next|api/chat).*)", // exclude /api/chat
    "/",
    "/(api|trpc)(.*)",
  ],
};

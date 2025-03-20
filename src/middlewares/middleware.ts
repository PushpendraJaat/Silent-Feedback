import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import csrf from "edge-csrf";
import { LRUCache } from "lru-cache";
import DOMPurify from "dompurify";

// ✅ CSRF Protection Setup
const csrfProtect = csrf({
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  },
});

// ✅ Rate Limiting Setup (Token Bucket Algorithm using LRU cache)
const tokenCache = new LRUCache<string, number>({
  max: 500, // Max 500 requests per minute per IP
  ttl: 60 * 1000, // 1-minute interval
});

const rateLimit = (request: NextRequest) => {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"; // Fallback to localhost if IP is not available

  if (!ip) return;

  const tokenCount = tokenCache.get(ip) || 0;

  if (tokenCount >= 500) {
    throw new Error("Rate limit exceeded");
  }

  tokenCache.set(ip, tokenCount + 1);
};

// ✅ Define Routes
const publicRoutes = ["/signin", "/signup", "/verify-email", "/home"];
const protectedRoutes = ["/dashboard"];

// ✅ Sanitize Input Using DOMPurify (Direct Mutation)
const sanitizeRequest = async (request: NextRequest) => {
  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    try {
      const body = await request.json();

      // Sanitize strings only (skip non-string values)
      for (const key in body) {
        if (typeof body[key] === "string") {
          body[key] = DOMPurify.sanitize(body[key]);
        }
      }

      // Return a new request with the sanitized body
      return new NextRequest(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error("[Sanitize Error]:", error);
    }
  }
  return request;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Skip GET and HEAD for CSRF and Rate Limit
  if (["GET", "HEAD"].includes(request.method)) {
    return NextResponse.next();
  }

  // ✅ Rate Limiting
  try {
    rateLimit(request);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Rate Limit]:", error);
    }
    return new NextResponse("Too many requests", { status: 429 });
  }

  // ✅ Sanitize Request Body
  request = await sanitizeRequest(request);

  // ✅ CSRF Protection
  try {
    const response = NextResponse.next();
    await csrfProtect(request, response);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[CSRF Error]:", error);
    }
    return new NextResponse("Invalid CSRF token", { status: 403 });
  }

  // ✅ Token-Based Redirection
  const token = await getToken({ req: request });
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/signin",
    "/signup",
    "/verify-email/:path*",
    "/dashboard/:path*",
    "/home",
    "/api/:path*",
  ],
};

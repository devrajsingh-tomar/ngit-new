import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Security Headers
const securityHeaders = {
    "Content-Security-Policy":
        `default-src 'self'; ` +
        `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; ` +
        `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ` +
        `img-src 'self' data: blob: https://*; ` +
        `font-src 'self' https://fonts.gstatic.com; ` +
        `frame-src 'self' https://api.razorpay.com https://*.razorpay.com https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com; ` +
        `connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com;`,
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(self), microphone=(), geolocation=(self), interest-cohort=()",
};

export async function proxy(request: NextRequest) {
    const response = NextResponse.next();

    // Apply Security Headers to all responses
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    const token = await getToken({ req: request });
    const { pathname } = request.nextUrl;

    // ─── Blocked Routes (Courses and Mock Tests) ───────────────────────────
    const blockedPaths = [
        "/student/courses",
        "/student/quizzes",
        "/student/results",
        "/admin/courses",
        "/admin/mock-tests",
        "/admin/results"
    ];
    const isBlocked = blockedPaths.some(prefix => 
        pathname === prefix || pathname.startsWith(prefix + "/")
    );
    if (isBlocked) {
        if (pathname.startsWith("/admin")) {
            return NextResponse.redirect(new URL("/admin", request.url));
        } else {
            return NextResponse.redirect(new URL("/student", request.url));
        }
    }

    // ─── Admin Route Protection ──────────────────────────────────────────────
    if (pathname.startsWith("/admin")) {
        if (pathname === "/admin/login") {
            // Already-logged-in admins go straight to dashboard
            if (token?.role === "ADMIN") {
                return NextResponse.redirect(new URL("/admin", request.url));
            }
            return response;
        }

        // No token → redirect to admin login
        if (!token) {
            const url = new URL("/admin/login", request.url);
            url.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(url);
        }

        // Wrong role → back to home
        if (token.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    // ─── Student Route Protection ────────────────────────────────────────────
    if (pathname.startsWith("/student")) {
        if (pathname === "/student/login") {
            // Already logged in → go to correct dashboard
            if (token) {
                const dest = token.role === "ADMIN" ? "/admin" : "/student";
                return NextResponse.redirect(new URL(dest, request.url));
            }
            return response;
        }

        // No token → redirect to student login
        if (!token) {
            const url = new URL("/student/login", request.url);
            url.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(url);
        }
    }

    // ─── Legacy /login → redirect to student login ───────────────────────────
    if (pathname === "/login") {
        if (token) {
            const dest = token.role === "ADMIN" ? "/admin" : "/student";
            return NextResponse.redirect(new URL(dest, request.url));
        }
        return NextResponse.redirect(new URL("/student/login", request.url));
    }

    return response;
}

export default proxy;

export const config = {
    matcher: [
        "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
    ],
};

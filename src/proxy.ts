import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getDashboardRoute, UserRole } from "@/lib/role-routing";

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

    // Redirect old Fee Management URL to the new unified Payments & Invoices dashboard
    if (pathname === "/admin/students/fees" || pathname.startsWith("/admin/students/fees/")) {
        return NextResponse.redirect(new URL("/admin/payments", request.url));
    }

    // ─── Dedicated Steno Login Page Protection ────────────────────────────────
    if (pathname === "/steno/login") {
        if (token) {
            const dest = getDashboardRoute(token.role as string);
            return NextResponse.redirect(new URL(dest, request.url));
        }
        return response;
    }

    // ─── Admin Route Protection & Role Authorization ──────────────────────────
    if (pathname.startsWith("/admin")) {
        if (pathname === "/admin/login") {
            // Already-logged-in admins go straight to their dashboard
            if (token) {
                const dest = getDashboardRoute(token.role as string);
                return NextResponse.redirect(new URL(dest, request.url));
            }
            return response;
        }

        // No token → redirect to admin login
        if (!token) {
            const url = new URL("/admin/login", request.url);
            url.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(url);
        }

        const role = token.role as string;

        // Student accessing admin routes → redirect to student portal
        if (role === UserRole.STUDENT || role === "STUDENT") {
            return NextResponse.redirect(new URL("/student", request.url));
        }

        // Root /admin route: Only ADMIN allowed directly; other management roles go to their specific dashboard
        if (pathname === "/admin" || pathname === "/admin/") {
            if (role !== UserRole.ADMIN && role !== "ADMIN") {
                return NextResponse.redirect(new URL(getDashboardRoute(role), request.url));
            }
            return response;
        }

        // /admin/steno routes: Allowed for ADMIN, STENO_ADMIN, CONTENT_MANAGER
        if (pathname.startsWith("/admin/steno")) {
            if (role === UserRole.ADMIN || role === UserRole.STENO_ADMIN || role === UserRole.CONTENT_MANAGER || role === "ADMIN" || role === "STENO_ADMIN" || role === "CONTENT_MANAGER") {
                return response;
            }
            return NextResponse.redirect(new URL(getDashboardRoute(role), request.url));
        }

        // /admin/typing routes: Allowed for ADMIN, TYPING_ADMIN, CONTENT_MANAGER
        if (pathname.startsWith("/admin/typing")) {
            if (role === UserRole.ADMIN || role === UserRole.TYPING_ADMIN || role === UserRole.CONTENT_MANAGER || role === "ADMIN" || role === "TYPING_ADMIN" || role === "CONTENT_MANAGER") {
                return response;
            }
            return NextResponse.redirect(new URL(getDashboardRoute(role), request.url));
        }

        // /admin/settings routes: Allowed for all admin management roles
        if (pathname.startsWith("/admin/settings")) {
            return response;
        }

        // Content Manager extra allowed routes (/admin/content, /admin/blogs)
        if (role === UserRole.CONTENT_MANAGER || role === "CONTENT_MANAGER") {
            if (pathname.startsWith("/admin/content") || pathname.startsWith("/admin/blogs")) {
                return response;
            }
            return NextResponse.redirect(new URL(getDashboardRoute(role), request.url));
        }

        // Other /admin/* routes: Require ADMIN role
        if (role !== UserRole.ADMIN && role !== "ADMIN") {
            return NextResponse.redirect(new URL(getDashboardRoute(role), request.url));
        }
    }

    // ─── Student Route Protection ────────────────────────────────────────────
    if (pathname.startsWith("/student")) {
        if (pathname === "/student/login") {
            // Already logged in → go to correct dashboard
            if (token) {
                const dest = getDashboardRoute(token.role as string);
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
            const dest = getDashboardRoute(token.role as string);
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

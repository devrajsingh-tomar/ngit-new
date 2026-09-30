import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { UserRole } from "@/models/User";
import { headers } from "next/headers";
import { isRateLimited } from "./rate-limit";

export type Role = UserRole | "ANY" | "GUEST" | string;

interface ActionOptions<T extends z.ZodType> {
    schema?: T;
    roles?: Role[];
    requireAuth?: boolean;
    rateLimit?: {
        limit: number;
        windowMs: number;
    };
}

export type ActionResponse<T> =
    | { success: true; data: T }
    | { success: false; error: string; code?: string };

export function createSafeAction<T extends z.ZodType, R>(
    options: ActionOptions<T>,
    handler: (data: z.infer<T>, session: any) => Promise<R>
) {
    return async (input: z.infer<T> = {} as any): Promise<ActionResponse<R>> => {
        try {
            // 1. Identify User/Client for Rate Limiting
            const headerList = await headers();
            const ip = headerList.get("x-forwarded-for") || "anonymous";
            
            // 2. Lazy Authentication Check
            let session: any = null;
            let isAuthenticated = false;

            // Only fetch session if auth is required, or specific roles are specified, or if rate limit might need it
            // "ANY" role implies no specific role is needed unless requireAuth is true.
            const needsAuth = options.requireAuth || (options.roles && options.roles.length > 0 && !options.roles.includes("ANY"));
            
            if (needsAuth || options.rateLimit) {
                try {
                    session = await getServerSession(authOptions);
                    isAuthenticated = !!session?.user;
                } catch (e) {
                    console.warn("Silent NextAuth Session Fetch Error Suppressed", e);
                }
            }

            if (options.requireAuth && !isAuthenticated) {
                return { success: false, error: "Authentication required", code: "UNAUTHORIZED" };
            }

            // 3. Authorization (Role) Check
            if (options.roles && options.roles.length > 0) {
                const userRole = session?.user?.role as Role;
                const isSuperAdmin = session?.user?.email === "admin@ngit.edu" || session?.user?.email === "admin@ngitedu.com";
                const hasRole = options.roles.includes("ANY") || options.roles.includes(userRole) || isSuperAdmin;

                if (!hasRole && (options.requireAuth || isAuthenticated)) {
                    return { success: false, error: "Insufficient permissions", code: "FORBIDDEN" };
                }
            }

            // 4. Rate Limiting Check
            if (options.rateLimit) {
                const identifier = isAuthenticated ? session!.user.id : ip;
                if (isRateLimited(identifier, options.rateLimit)) {
                    return { success: false, error: "Too many requests. Please try again later.", code: "RATE_LIMITED" };
                }
            }

            // 5. Input Validation
            let validatedData = input;
            if (options.schema) {
                const result = options.schema.safeParse(input);
                if (!result.success) {
                    const errorMessage = result.error.errors
                        .map((e) => `${e.path.join(".")}: ${e.message}`)
                        .join(", ");
                    return { success: false, error: `Validation failed: ${errorMessage}`, code: "VALIDATION_ERROR" };
                }
                validatedData = result.data;
            }

            // 6. Execute Handler
            const data = await handler(validatedData, session);

            return { success: true, data };
        } catch (error: any) {
            console.error("Action Error:", error);
            
            // Production error handling - hide internal details
            const isProduction = process.env.NODE_ENV === "production";
            const message = isProduction 
                ? "An internal server error occurred. Please try again later."
                : error.message || "An error occurred";

            return { success: false, error: message, code: "SERVER_ERROR" };
        }
    };
}

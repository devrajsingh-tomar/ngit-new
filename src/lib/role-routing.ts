import { UserRole } from "@/models/User";

/**
 * Centralized Role-to-Dashboard Route Mapping
 * 
 * Role Mapping Rules:
 * - STENO_ADMIN     -> /admin/steno
 * - CONTENT_MANAGER -> /admin/steno
 * - TYPING_ADMIN    -> /admin/typing
 * - ADMIN           -> /admin (Existing main admin dashboard)
 * - STUDENT         -> /student
 * - Default         -> /
 */
export function getDashboardRoute(role?: string | UserRole | null): string {
    if (!role) return "/";
    
    switch (role) {
        case UserRole.STENO_ADMIN:
        case UserRole.CONTENT_MANAGER:
        case "STENO_ADMIN":
        case "CONTENT_MANAGER":
            return "/admin/steno";
            
        case UserRole.TYPING_ADMIN:
        case "TYPING_ADMIN":
            return "/admin/typing";
            
        case UserRole.ADMIN:
        case "ADMIN":
            return "/admin";
            
        case UserRole.STUDENT:
        case "STUDENT":
            return "/student";
            
        default:
            return "/";
    }
}

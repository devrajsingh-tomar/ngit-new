export enum UserRole {
    ADMIN = "ADMIN",
    STUDENT = "STUDENT",
    STENO_ADMIN = "STENO_ADMIN",
    TYPING_ADMIN = "TYPING_ADMIN",
    CONTENT_MANAGER = "CONTENT_MANAGER",
}

/**
 * Centralized Role-to-Dashboard Route Mapping (Browser & Server Safe)
 * 
 * Role Mapping Rules:
 * - ADMIN           -> /admin (Full Admin Workspace)
 * - CONTENT_MANAGER -> /manager/dashboard (Dedicated Manager Workspace)
 * - STENO_ADMIN     -> /steno/admin/dashboard (Dedicated Steno Workspace)
 * - TYPING_ADMIN    -> /manager/typing (Typing Manager)
 * - STUDENT         -> /student
 * - Default         -> /
 */
export function getDashboardRoute(role?: string | UserRole | null): string {
    if (!role) return "/";
    
    switch (role) {
        case UserRole.ADMIN:
        case "ADMIN":
            return "/admin";
            
        case UserRole.CONTENT_MANAGER:
        case "CONTENT_MANAGER":
        case "MANAGER":
            return "/manager/dashboard";

        case UserRole.STENO_ADMIN:
        case "STENO_ADMIN":
            return "/steno/admin/dashboard";

        case UserRole.TYPING_ADMIN:
        case "TYPING_ADMIN":
            return "/manager/typing";
            
        case UserRole.STUDENT:
        case "STUDENT":
            return "/";
            
        default:
            return "/";
    }
}

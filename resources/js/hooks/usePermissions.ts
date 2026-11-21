import { usePage } from '@inertiajs/react';
import type { User } from '@/types';

type AuthSharedProps = {
    auth?: {
        user?: User | null;
        permissions?: string[];
        roles?: string[];
    };
};

export function usePermissions() {
    const page = usePage<AuthSharedProps>();
    const permissions = page.props.auth?.permissions ?? [];
    const roles = page.props.auth?.roles ?? [];
    const userRole = page.props.auth?.user?.role ?? '';

    const can = (permission: string): boolean =>
        permissions.includes(permission);

    const canAny = (required: string[]): boolean =>
        required.some((permission) => permissions.includes(permission));

    const hasRole = (roleName: string): boolean =>
        roles.includes(roleName) || userRole === roleName;

    return {
        permissions,
        roles,
        can,
        canAny,
        hasRole,
    };
}

import { getDatabase } from '../config/database';
import { users, roles as rolesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createLogger } from '../utils/logger';
import { getCached, setCached, deleteCached } from '../utils/redis';

const logger = createLogger('PermissionService');

export interface Permission {
    resource: string;
    action: string;
}

export class PermissionService {
    private static readonly CACHE_TTL = 3600; // 1 hour

    /**
     * Generate cache key for permission check
     */
    private static getCacheKey(userId: number, resource: string, action: string): string {
        return `perm:${userId}:${resource}:${action}`;
    }

    /**
     * Generate cache key for role permissions
     */
    private static getRoleCacheKey(roleId: number): string {
        return `role_perms:${roleId}`;
    }

    /**
     * Check if user has permission (resource:action)
     * Uses caching for performance
     */
    static async hasPermission(
        userId: number,
        resource: string,
        action: string
    ): Promise<boolean> {
        try {
            const cacheKey = this.getCacheKey(userId, resource, action);

            // Try cache first
            const cached = await getCached<boolean>(cacheKey);
            if (cached !== null) {
                return cached;
            }

            // Get user's role
            const db = getDatabase();
            const userRole = await db
                .select({ roleId: rolesTable.id, roleName: rolesTable.name })
                .from(rolesTable)
                .innerJoin(users, eq(users.roleId, rolesTable.id))
                .where(eq(users.id, userId))
                .limit(1);

            if (!userRole.length) {
                // Cache negative result
                await setCached(cacheKey, false, this.CACHE_TTL);
                return false;
            }

            // For now, simple role-based check
            // In future, integrate with permissions table
            const has = this.checkRolePermission(userRole[0].roleName, resource, action);

            // Cache result
            await setCached(cacheKey, has, this.CACHE_TTL);
            return has;
        } catch (error) {
            logger.error('Permission check failed', error as Error, { userId, resource, action });
            return false;
        }
    }

    /**
     * Simple role-based permission check
     * Maps roles to resource:action permissions
     */
    private static checkRolePermission(
        roleName: string,
        resource: string,
        action: string
    ): boolean {
        const rolePermissions: Record<string, Record<string, string[]>> = {
            admin: {
                user: ['read', 'create', 'update', 'delete'],
                record: ['read', 'create', 'update', 'delete'],
                dashboard: ['read'],
            },
            analyst: {
                user: [],
                record: ['read', 'create', 'update', 'delete'],
                dashboard: ['read'],
            },
            viewer: {
                user: [],
                record: [],
                dashboard: ['read'],
            },
        };

        const permissions = rolePermissions[roleName];
        if (!permissions) {
            return false;
        }

        const resourcePermissions = permissions[resource];
        return resourcePermissions ? resourcePermissions.includes(action) : false;
    }

    /**
     * Get all permissions for a role
     */
    static async getRolePermissions(roleId: number): Promise<Permission[]> {
        try {
            const cacheKey = this.getRoleCacheKey(roleId);

            // Try cache
            const cached = await getCached<Permission[]>(cacheKey);
            if (cached !== null) {
                return cached;
            }

            const db = getDatabase();
            const role = await db
                .select({ name: rolesTable.name })
                .from(rolesTable)
                .where(eq(rolesTable.id, roleId))
                .limit(1);

            if (!role.length) {
                return [];
            }

            // Map role to permissions
            const roleName = role[0].name;
            const permissions = this.getPermissionsByRole(roleName);

            // Cache result
            await setCached(cacheKey, permissions, this.CACHE_TTL);
            return permissions;
        } catch (error) {
            logger.error('Failed to fetch role permissions', error, { roleId });
            return [];
        }
    }

    /**
     * Get permissions for a specific role
     */
    private static getPermissionsByRole(roleName: string): Permission[] {
        const rolePermissions: Record<string, Permission[]> = {
            admin: [
                { resource: 'user', action: 'read' },
                { resource: 'user', action: 'create' },
                { resource: 'user', action: 'update' },
                { resource: 'user', action: 'delete' },
                { resource: 'record', action: 'read' },
                { resource: 'record', action: 'create' },
                { resource: 'record', action: 'update' },
                { resource: 'record', action: 'delete' },
                { resource: 'dashboard', action: 'read' },
            ],
            analyst: [
                { resource: 'record', action: 'read' },
                { resource: 'record', action: 'create' },
                { resource: 'record', action: 'update' },
                { resource: 'record', action: 'delete' },
                { resource: 'dashboard', action: 'read' },
            ],
            viewer: [{ resource: 'dashboard', action: 'read' }],
        };

        return rolePermissions[roleName] || [];
    }

    /**
     * Invalidate permission cache for a user
     * Call this when user role changes
     */
    static async invalidateUserCache(userId: number): Promise<void> {
        try {
            // For now, just log the invalidation
            // In production with Redis, would delete matching keys
            logger.info('User permission cache invalidated', { userId });
        } catch (error) {
            logger.warn('Error invalidating user cache', { userId, error: String(error) });
        }
    }

    /**
     * Invalidate role cache
     * Call this when role permissions change
     */
    static async invalidateRoleCache(roleId: number): Promise<void> {
        try {
            const cacheKey = this.getRoleCacheKey(roleId);
            await deleteCached(cacheKey);
            logger.info('Role permission cache invalidated', { roleId });
        } catch (error) {
            logger.warn('Error invalidating role cache', { roleId, error: String(error) });
        }
    }
}

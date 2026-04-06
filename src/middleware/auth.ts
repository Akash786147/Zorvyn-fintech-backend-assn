import { Request, Response, NextFunction } from 'express';
import { errorFactory } from '../utils/errors';
import { createLogger } from '../utils/logger';
import { UserService } from '../services/userService';
import { PermissionService } from '../services/permissionService';

const logger = createLogger('auth');

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        username: string;
        email: string;
        roleId: number;
        roleName: string;
    };
}

/**
 * Authenticate user (verify identity)
 * Expects x-user-id header (for assignment demo)
 * In production, verify JWT tokens here
 */
export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
        const userId = req.header('x-user-id');

        if (!userId || isNaN(Number(userId))) {
            logger.warn('Missing or invalid x-user-id header', { path: req.path });
            return next(errorFactory.unauthorized('Missing x-user-id header'));
        }

        (req as any).user = { id: Number(userId) };
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Authorize based on resource + action (RBAC with caching)
 * Example: authorize('user', 'read')
 * Permissions are cached via Redis for performance
 */
export const authorize = (resource: string, action: string) => {
    return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                logger.warn('User not authenticated', { path: req.path });
                return next(errorFactory.unauthorized('User not authenticated'));
            }

            // Check if user is active
            const userData = await UserService.getUserById(userId);

            if (!userData.isActive) {
                logger.warn('User inactive', { userId, path: req.path });
                return next(errorFactory.forbidden('Your account has been deactivated'));
            }

            // Check RBAC permission (with caching)
            const hasPermission = await PermissionService.hasPermission(userId, resource, action);

            if (!hasPermission) {
                logger.warn('Permission denied', {
                    userId,
                    resource,
                    action,
                    path: req.path,
                });
                return next(
                    errorFactory.forbidden(
                        `You don't have permission to ${action} ${resource}`
                    )
                );
            }

            // Get role name for context
            const roleName = await UserService.getUserRoleName(userId);

            // Attach full user info to request
            (req as any).user = {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                roleId: userData.roleId,
                roleName,
            };

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * ABAC layer: Check resource ownership
 * Example: authorizeOwnership('record', 'userId')
 * Users can only access their own resources (unless admin)
 */
export const authorizeOwnership = (resource: string, paramName: string = 'userId') => {
    return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id;
            const targetId = req.params[paramName] || req.body[paramName];

            if (!userId) {
                logger.warn('User not authenticated for ownership check', { path: req.path });
                return next(errorFactory.unauthorized('User not authenticated'));
            }

            const roleName = await UserService.getUserRoleName(userId);

            // Admins bypass ownership checks
            if (roleName === 'admin') {
                return next();
            }

            // For non-admins, user must own the resource
            if (Number(targetId) !== userId) {
                logger.warn('Ownership check failed', {
                    userId,
                    targetId,
                    resource,
                    path: req.path,
                });
                return next(
                    errorFactory.forbidden(
                        `You don't have access to this ${resource}`
                    )
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

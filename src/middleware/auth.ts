import { Request, Response, NextFunction } from 'express';
import { errorFactory, createLogger } from '../utils/index';
import { UserService, PermissionService } from '../services/index';
import {
    verifyAccessToken,
} from '../utils/jwt';

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

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            logger.warn('Missing authorization header', { path: req.path });
            return next(errorFactory.unauthorized('Authorization header is required'));
        }

        const token = authHeader.split(" ")[1];

        const decoded = verifyAccessToken(token);
        if (!decoded) {
            logger.warn('Invalid or expired token', { path: req.path });
            return next(errorFactory.unauthorized('Invalid or expired token'));
        }

        const userData = await UserService.getUserById(decoded.id);
        if (!userData.isActive) {
            logger.warn('User inactive', { userId: decoded.id, path: req.path });
            return next(errorFactory.forbidden('Your account has been deactivated'));
        }

        // Attach user info to request
        (req as any).user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            roleId: decoded.roleId,
            roleName: decoded.roleName,
        };

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

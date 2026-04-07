import { Response } from 'express';
import bcryptjs from 'bcryptjs';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserService } from '../services/userService';
import { errorFactory, generateTokenPair, verifyRefreshToken, generateAccessToken, createLogger } from '../utils/index';

const logger = createLogger('auth-controller');

export const login = async (req: any, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        let user = undefined;
        if (username) {
            user = await UserService.getUserByUsername(username);
        } else if (email) {
            user = await UserService.getUserByEmail(email);
        }

        if (!user || user.password === null || user === undefined) {
            logger.warn('Login failed: user not found', { username });
            throw errorFactory.unauthorized('Invalid username or password');
        }

        if (!user.isActive) {
            logger.warn('Login failed: user inactive', { userId: user.id, username });
            throw errorFactory.forbidden('Your account has been deactivated');
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password || '');

        if (!isPasswordValid) {
            logger.warn('Login failed: invalid password', { userId: user.id, username });
            throw errorFactory.unauthorized('Invalid username or password');
        }

        const roleName = await UserService.getUserRoleName(user.id);

        // Generate tokens
        const tokenPayload = {
            id: user.id,
            username: user.username,
            email: user.email,
            roleId: user.roleId,
            roleName,
        };

        const tokens = generateTokenPair(tokenPayload);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roleId: user.roleId,
                    roleName,
                },
                tokens: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    expiresIn: tokens.expiresIn,
                },
            },
        });
    } catch (error) {
        if (error instanceof Error && 'status' in error) {
            res.status((error as any).status).json({
                success: false,
                message: (error as any).message || 'Login failed',
            });
        } else {
            logger.error('Login error', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }
};


export const refreshToken = async (req: any, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;
        const decoded = verifyRefreshToken(refreshToken);

        if (!decoded) {
            logger.warn('Token refresh failed: invalid refresh token');
            throw errorFactory.unauthorized('Invalid or expired refresh token');
        }

        const user = await UserService.getUserById(decoded.id);

        if (!user.isActive) {
            logger.warn('Token refresh failed: user inactive', { userId: user.id });
            throw errorFactory.forbidden('Your account has been deactivated');
        }

        // Get user role
        const roleName = await UserService.getUserRoleName(user.id);

        // Generate new access token
        const newAccessToken = generateAccessToken({
            id: user.id,
            username: user.username,
            email: user.email,
            roleId: user.roleId,
            roleName,
        });

        logger.info('Access token refreshed', { userId: user.id });

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken,
                expiresIn: parseInt(process.env.JWT_EXPIRY || '3600', 10),
            },
        });
    } catch (error) {
        if (error instanceof Error && 'status' in error) {
            res.status((error as any).status).json({
                success: false,
                message: (error as any).message || 'Token refresh failed',
            });
        } else {
            logger.error('Token refresh error', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }
};


export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            throw errorFactory.unauthorized('User not authenticated');
        }

        const user = await UserService.getUserById(userId);
        const roleName = await UserService.getUserRoleName(userId);

        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                roleId: user.roleId,
                roleName,
                isActive: user.isActive,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        if (error instanceof Error && 'status' in error) {
            res.status((error as any).status).json({
                success: false,
                message: (error as any).message || 'Failed to fetch user',
            });
        } else {
            logger.error('Get current user error', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }
};


export const registerUser = async (req: any, res: Response): Promise<void> => {
    try {
        const { username, email, password, name } = req.body;

        const createUser = await UserService.createUser(
            username,
            email,
            name,
            'user', // default role
            password
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: createUser.id,
                username: createUser.username,
                email: createUser.email,
                name: createUser.name,
                roleId: createUser.roleId,
                isActive: createUser.isActive
            },
        });

    } catch (error) {
        if (error instanceof Error && 'status' in error) {
            res.status((error as any).status).json({
                success: false,
                message: (error as any).message || 'Registration failed',
            });
        } else {
            logger.error('Registration error', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }
};
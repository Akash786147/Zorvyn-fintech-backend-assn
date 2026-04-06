/**
 * User Service - handles user management
 */

import { getDatabase } from '@config/database';
import { users } from '@db/schema';
import { eq, or } from 'drizzle-orm';
import { createLogger } from '@utils/logger';
import { errorFactory } from '@utils/errors';
import { RoleService } from './roleService';

const logger = createLogger('UserService');

export class UserService {
  /**
   * Get all users
   */
  static async getAllUsers(includeInactive = false) {
    try {
      const db = getDatabase();

      if (!includeInactive) {
        return await db.select().from(users).where(eq(users.isActive, true));
      }

      return await db.select().from(users);
    } catch (error) {
      logger.error('Failed to fetch users', error);
      throw errorFactory.serviceUnavailable('Failed to fetch users');
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: number) {
    try {
      const db = getDatabase();
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

      if (!result.length) {
        throw errorFactory.notFound('User not found');
      }

      return result[0];
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      logger.error('Failed to fetch user', error, { userId: id });
      throw errorFactory.serviceUnavailable('Failed to fetch user');
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string) {
    try {
      const db = getDatabase();
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0] || null;
    } catch (error) {
      logger.error('Failed to fetch user by email', error);
      throw errorFactory.serviceUnavailable('Failed to fetch user');
    }
  }

  /**
   * Create new user
   */
  static async createUser(
    username: string,
    email: string,
    name: string,
    roleName: string
  ) {
    try {
      const db = getDatabase();

      // Validate email format
      if (!email.includes('@')) {
        throw errorFactory.badRequest('Invalid email format');
      }

      // Check if user already exists
      const existing = await db
        .select()
        .from(users)
        .where(or(eq(users.email, email), eq(users.username, username)))
        .limit(1);

      if (existing.length) {
        throw errorFactory.conflict('User with this email or username already exists');
      }

      // Get role
      const role = await RoleService.getRoleByName(roleName);
      if (!role) {
        throw errorFactory.badRequest(`Role '${roleName}' does not exist`);
      }

      const result = await db
        .insert(users)
        .values({
          username,
          email,
          name,
          roleId: role.id,
        })
        .returning();

      logger.info('User created', { userId: result[0].id, email });
      return result[0];
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('already exists') ||
          error.message.includes('Invalid') ||
          error.message.includes('does not exist')
        ) {
          throw error;
        }
      }
      logger.error('Failed to create user', error);
      throw errorFactory.serviceUnavailable('Failed to create user');
    }
  }

  /**
   * Update user
   */
  static async updateUser(
    id: number,
    updates: {
      name?: string;
      email?: string;
      isActive?: boolean;
      roleName?: string;
    }
  ) {
    try {
      const db = getDatabase();

      // Get existing user (validates existence)
      await this.getUserById(id);

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (updates.name) updateData.name = updates.name;
      if (updates.email) {
        if (!updates.email.includes('@')) {
          throw errorFactory.badRequest('Invalid email format');
        }
        updateData.email = updates.email;
      }
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

      if (updates.roleName) {
        const role = await RoleService.getRoleByName(updates.roleName);
        if (!role) {
          throw errorFactory.badRequest(`Role '${updates.roleName}' does not exist`);
        }
        updateData.roleId = role.id;
      }

      const result = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      logger.info('User updated', { userId: id });
      return result[0];
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      logger.error('Failed to update user', error, { userId: id });
      throw errorFactory.serviceUnavailable('Failed to update user');
    }
  }

  /**
   * Deactivate user
   */
  static async deactivateUser(id: number) {
    return this.updateUser(id, { isActive: false });
  }

  /**
   * Get user role name
   */
  static async getUserRoleName(userId: number) {
    try {
      const user = await this.getUserById(userId);
      const role = await RoleService.getRoleById(user.roleId);
      return role.name;
    } catch (error) {
      logger.error('Failed to get user role', error, { userId });
      throw errorFactory.serviceUnavailable('Failed to get user role');
    }
  }
}

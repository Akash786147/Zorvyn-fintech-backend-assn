/**
 * Role Service - handles role management
 */

import { getDatabase } from '../config/database';
import { roles } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createLogger } from '../utils/logger';
import { errorFactory } from '../utils/errors';

const logger = createLogger('RoleService');

export class RoleService {
  /**
   * Get all roles
   */
  static async getAllRoles() {
    try {
      const db = getDatabase();
      return await db.select().from(roles);
    } catch (error) {
      logger.error('Failed to fetch roles', error);
      throw errorFactory.serviceUnavailable('Failed to fetch roles');
    }
  }

  /**
   * Get role by ID
   */
  static async getRoleById(id: number) {
    try {
      const db = getDatabase();
      const result = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
      if (!result.length) {
        throw errorFactory.notFound('Role not found');
      }
      return result[0];
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      logger.error('Failed to fetch role', error, { roleId: id });
      throw errorFactory.serviceUnavailable('Failed to fetch role');
    }
  }

  /**
   * Get role by name
   */
  static async getRoleByName(name: string) {
    try {
      const db = getDatabase();
      const result = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
      return result[0] || null;
    } catch (error) {
      logger.error('Failed to fetch role by name', error, { roleName: name });
      throw errorFactory.serviceUnavailable('Failed to fetch role');
    }
  }

  /**
   * Create new role
   */
  static async createRole(name: string, description?: string) {
    try {
      const db = getDatabase();

      // Check if role already exists
      const existing = await this.getRoleByName(name);
      if (existing) {
        throw errorFactory.conflict(`Role '${name}' already exists`);
      }

      const result = await db
        .insert(roles)
        .values({
          name,
          description,
        })
        .returning();

      logger.info('Role created', { roleName: name });
      return result[0];
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          throw error;
        }
      }
      logger.error('Failed to create role', error);
      throw errorFactory.serviceUnavailable('Failed to create role');
    }
  }

  /**
   * Initialize default roles if they don't exist
   */
  static async initializeDefaultRoles() {
    try {
      const defaultRoles = [
        { name: 'viewer', description: 'Can view dashboard and records' },
        { name: 'analyst', description: 'Can view records and access analytics' },
        { name: 'admin', description: 'Full access to all features' },
      ];

      for (const role of defaultRoles) {
        const existing = await this.getRoleByName(role.name);
        if (!existing) {
          await this.createRole(role.name, role.description);
          logger.info('Default role created', { roleName: role.name });
        }
      }
    } catch (error) {
      logger.error('Failed to initialize default roles', error);
    }
  }
}

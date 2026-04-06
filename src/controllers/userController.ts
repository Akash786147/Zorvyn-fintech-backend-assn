import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { successResponse, errorResponse } from '../utils/response';
import { UserService } from '../services/userService';
import { RoleService } from '../services/roleService';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, name, roleName } = req.body;

  if (!username || !email || !name || !roleName) {
    res.status(400).json(
      errorResponse('Missing required fields: username, email, name, roleName', req.path)
    );
    return;
  }

  const user = await UserService.createUser(username, email, name, roleName);

  res.status(201).json(
    successResponse(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      req.path,
      'User created successfully'
    )
  );
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const includeInactive = req.query.inactive === 'true';
  const allUsers = await UserService.getAllUsers(includeInactive);

  res.status(200).json(
    successResponse(
      allUsers.map((u: {
        id: number;
        username: string;
        email: string;
        name: string;
        roleId: number;
        isActive: boolean;
        createdAt: unknown;
      }) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        name: u.name,
        roleId: u.roleId,
        isActive: u.isActive,
        createdAt: u.createdAt,
      })),
      req.path,
      `Found ${allUsers.length} users`
    )
  );
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await UserService.getUserById(Number(id));

  res.status(200).json(
    successResponse(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      req.path
    )
  );
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, isActive, roleName } = req.body;

  const user = await UserService.updateUser(Number(id), {
    name,
    email,
    isActive,
    roleName,
  });

  res.status(200).json(
    successResponse(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        isActive: user.isActive,
        updatedAt: user.updatedAt,
      },
      req.path,
      'User updated successfully'
    )
  );
});

export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await UserService.deactivateUser(Number(id));

  res.status(200).json(
    successResponse({ id: user.id, isActive: user.isActive }, req.path, 'User deactivated')
  );
});

export const getAllRoles = asyncHandler(async (req: Request, res: Response) => {
  const allRoles = await RoleService.getAllRoles();

  res.status(200).json(
    successResponse(allRoles, req.path, `Found ${allRoles.length} roles`)
  );
});

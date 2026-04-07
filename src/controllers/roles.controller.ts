import { Request, Response } from 'express';
import { RoleService } from '../services/roleService';

export const createRole = async (req: Request, res: Response) => {
    try {
        const role = await RoleService.createRole(req.body.name, req.body.description);
        res.status(201).json(role);
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const getAllRoles = async (res: Response) => {
    try {
        const roles = await RoleService.getAllRoles();
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const getRoleById = async (req: Request, res: Response) => {
    try {
        const role = await RoleService.getRoleById(Number(req.params.id));
        return res.status(200).json(role);
    } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const updateRole = async (req: Request, res: Response) => {
    try {
        const role = await RoleService.updateRole(Number(req.params.id), req.body.name, req.body.description);
        return res.status(200).json(role);

    } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const deleteRole = async (req: Request, res: Response) => {
    try {
        await RoleService.deleteRole(Number(req.params.id));
        return res.status(204).send();
    } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

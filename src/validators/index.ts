import { authValidations } from './auth.validation';
import { userValidations } from './users.validation';
import { recordValidations, dashboardValidations } from './records.validation';

export const validationSchemas = {
    ...authValidations,
    ...userValidations,
    ...recordValidations,
    ...dashboardValidations,
};

export type ValidationSchemasType = typeof validationSchemas;
export type ValidationPaths = keyof ValidationSchemasType;
export type ValidMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

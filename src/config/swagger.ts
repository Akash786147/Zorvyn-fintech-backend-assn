import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Zorvyn Fintech Backend API',
            version: '1.0.0',
            description: 'Production-grade fintech backend with RBAC, ABAC, and Redis caching',
            contact: {
                name: 'Zorvyn Finance',
                email: 'support@zorvyn.com',
            },
            license: {
                name: 'MIT',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
                description: 'Development server',
            },
            {
                url: 'https://zorvyn-fintech-backend-assn.vercel.app/api/v1',
                description: 'Vercel Production server',
            },
            {
                url: 'https://api.zorvyn.com/api/v1',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token (e.g. Bearer eyJhb...)',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        username: { type: 'string', example: 'john_doe' },
                        email: { type: 'string', example: 'john@example.com' },
                        name: { type: 'string', example: 'John Doe' },
                        roleId: { type: 'integer', example: 2 },
                        isActive: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Role: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string', enum: ['viewer', 'analyst', 'admin'] },
                        description: { type: 'string' },
                    },
                },
                FinancialRecord: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        userId: { type: 'integer' },
                        amount: { type: 'number', format: 'decimal' },
                        type: { type: 'string', enum: ['income', 'expense'] },
                        category: { type: 'string' },
                        description: { type: 'string' },
                        transactionDate: { type: 'string', format: 'date-time' },
                        isDeleted: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                DashboardSummary: {
                    type: 'object',
                    properties: {
                        totalIncome: { type: 'number' },
                        totalExpenses: { type: 'number' },
                        balance: { type: 'number' },
                        topCategories: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    category: { type: 'string' },
                                    income: { type: 'number' },
                                    expense: { type: 'number' },
                                },
                            },
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        message: { type: 'string' },
                        timestamp: { type: 'string', format: 'date-time' },
                        path: { type: 'string' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        path.join(__dirname, '../routes/*.ts'),
        path.join(__dirname, '../routes/*.js'),
        path.join(__dirname, '../controllers/*.ts'),
        path.join(__dirname, '../controllers/*.js'),
    ],
};

export const swaggerSpec = swaggerJsdoc(options);

/**
 * Swagger documentation inline for routes
 * Add these comments to route files for full documentation
 *
 * Example:
 * 
 * /**
 *  * @swagger
 *  * /users:
 *  *   post:
 *  *     summary: Create a new user
 *  *     tags: [Users]
 *  *     requestBody:
 *  *       required: true
 *  *       content:
 *  *         application/json:
 *  *           schema:
 *  *             $ref: '#/components/schemas/User'
 *  *     responses:
 *  *       201:
 *  *         description: User created successfully
 *  *       400:
 *  *         description: Validation error
 *  *       403:
 *  *         description: Insufficient permissions
 */

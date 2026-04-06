/**
 * Standardized API response format
 */

export interface ApiResponse<T = any> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
    timestamp: string;
    path: string;
}

export interface PaginatedResponse<T = any> {
    status: 'success' | 'error';
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    timestamp: string;
}

/**
 * Helper to format successful responses
 */
export const successResponse = <T>(
    data: T,
    path: string,
    message?: string
): ApiResponse<T> => {
    return {
        status: 'success',
        data,
        message,
        timestamp: new Date().toISOString(),
        path,
    };
};

/**
 * Helper to format error responses
 */
export const errorResponse = (
    message: string,
    path: string
): ApiResponse => {
    return {
        status: 'error',
        message,
        timestamp: new Date().toISOString(),
        path,
    };
};

/**
 * Helper for paginated responses
 */
export const paginatedResponse = <T>(
    data: T[],
    page: number,
    limit: number,
    total: number
): PaginatedResponse<T> => {
    return {
        status: 'success',
        data,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
        timestamp: new Date().toISOString(),
    };
};

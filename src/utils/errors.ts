
export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public isOperational: boolean = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}


export const errorFactory = {
    badRequest: (message: string = 'Bad Request'): AppError =>
        new AppError(400, message),
    unauthorized: (message: string = 'Unauthorized'): AppError =>
        new AppError(401, message),
    forbidden: (message: string = 'Forbidden'): AppError =>
        new AppError(403, message),
    notFound: (message: string = 'Resource not found'): AppError =>
        new AppError(404, message),
    conflict: (message: string = 'Conflict'): AppError =>
        new AppError(409, message),
    unprocessable: (message: string = 'Unprocessable Entity'): AppError =>
        new AppError(422, message),
    serviceUnavailable: (message: string = 'Service Unavailable'): AppError =>
        new AppError(503, message),
};

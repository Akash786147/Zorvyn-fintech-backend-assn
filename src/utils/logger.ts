export enum LogLevel {
    ERROR = 'ERROR',
    WARN = 'WARN',
    INFO = 'INFO',
    DEBUG = 'DEBUG',
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    service: string;
    context?: Record<string, any>;
    error?: string;
}

class Logger {
    private service: string;
    private logLevel: LogLevel;

    constructor(service: string) {
        this.service = service;
        this.logLevel = (process.env.LOG_LEVEL?.toUpperCase() as LogLevel) || LogLevel.INFO;
    }

    private shouldLog(level: LogLevel): boolean {
        const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
        const currentIndex = levels.indexOf(this.logLevel);
        const messageIndex = levels.indexOf(level);
        return messageIndex <= currentIndex;
    }

    private format(entry: LogEntry): string {
        return JSON.stringify(entry);
    }

    error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            const entry: LogEntry = {
                timestamp: new Date().toISOString(),
                level: LogLevel.ERROR,
                message,
                service: this.service,
                context,
                error: error instanceof Error ? error.stack : String(error),
            };
            console.error(this.format(entry));
        }
    }

    warn(message: string, context?: Record<string, any>): void {
        if (this.shouldLog(LogLevel.WARN)) {
            const entry: LogEntry = {
                timestamp: new Date().toISOString(),
                level: LogLevel.WARN,
                message,
                service: this.service,
                context,
            };
            console.warn(this.format(entry));
        }
    }

    info(message: string, context?: Record<string, any>): void {
        if (this.shouldLog(LogLevel.INFO)) {
            const entry: LogEntry = {
                timestamp: new Date().toISOString(),
                level: LogLevel.INFO,
                message,
                service: this.service,
                context,
            };
            console.log(this.format(entry));
        }
    }

    debug(message: string, context?: Record<string, any>): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            const entry: LogEntry = {
                timestamp: new Date().toISOString(),
                level: LogLevel.DEBUG,
                message,
                service: this.service,
                context,
            };
            console.log(this.format(entry));
        }
    }
}

export const createLogger = (service: string): Logger => {
    return new Logger(service);
};

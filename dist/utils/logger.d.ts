import winston from 'winston';
declare const logger: winston.Logger;
/**
 * Audit Log Helper
 * Use this to log sensitive business actions (e.g., deletions, settings changes)
 */
export declare const auditLog: (action: string, userId: string, metadata?: any) => void;
export default logger;

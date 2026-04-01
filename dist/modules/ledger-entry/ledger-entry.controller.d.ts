import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
export declare class LedgerEntryController {
    /**
     * Create a new ledger entry
     */
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * List all ledger entries for current user
     */
    getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get a single ledger entry
     */
    getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update a ledger entry
     */
    update(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete a ledger entry
     */
    delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Export ledger entries as CSV
     */
    export(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getOverview(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get ledger statistics for charts
     */
    getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: LedgerEntryController;
export default _default;

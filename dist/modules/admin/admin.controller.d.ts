import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
export declare class AdminController {
    getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: AdminController;
export default _default;

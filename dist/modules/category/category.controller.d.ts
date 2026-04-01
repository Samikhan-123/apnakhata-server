import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
export declare class CategoryController {
    /**
     * List all categories for current user
     */
    getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Create a new category
     */
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update a category
     */
    update(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete a category
     */
    delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: CategoryController;
export default _default;

import { Response, NextFunction } from 'express';
export declare class RecurringController {
    create(req: any, res: Response, next: NextFunction): Promise<void>;
    getAll(req: any, res: Response, next: NextFunction): Promise<void>;
    delete(req: any, res: Response, next: NextFunction): Promise<void>;
    processManual(req: any, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: RecurringController;
export default _default;

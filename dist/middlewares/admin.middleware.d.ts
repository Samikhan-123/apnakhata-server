import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
export declare const isAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;

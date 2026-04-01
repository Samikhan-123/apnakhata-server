import authService from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
export class AuthController {
    async register(req, res, next) {
        try {
            const validatedData = registerSchema.parse(req.body);
            const result = await authService.register(validatedData);
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                ...result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const validatedData = loginSchema.parse(req.body);
            const result = await authService.login(validatedData);
            res.status(200).json({
                success: true,
                message: 'Login successful',
                ...result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getMe(req, res, next) {
        try {
            res.status(200).json({
                success: true,
                user: req.user,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new AuthController();
//# sourceMappingURL=auth.controller.js.map
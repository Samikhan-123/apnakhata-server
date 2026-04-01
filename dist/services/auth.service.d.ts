import { RegisterInput, LoginInput } from '../schemas/auth.schema.js';
export declare class AuthService {
    register(data: RegisterInput): Promise<{
        user: {
            name: string | null;
            email: string;
            id: string;
            createdAt: Date;
        };
        token: string;
    }>;
    login(data: LoginInput): Promise<{
        user: {
            name: string | null;
            email: string;
            id: string;
            googleId: string | null;
            image: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        token: string;
    }>;
}
declare const _default: AuthService;
export default _default;

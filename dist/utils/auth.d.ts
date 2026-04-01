import 'dotenv/config';
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
export declare const generateToken: (id: string) => string;
export declare const verifyToken: (token: string) => any;

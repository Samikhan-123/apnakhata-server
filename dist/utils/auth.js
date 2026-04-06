import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const SALT_ROUNDS = 10;
// hash password  
export const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUNDS);
};
// compare password 
export const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};
// generate token 
export const generateToken = (id) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ id }, secret, {
        expiresIn: '30d',
    });
};
export const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.verify(token, secret);
};
//# sourceMappingURL=auth.js.map
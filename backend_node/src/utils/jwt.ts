import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'goa-city-secret-2026';

export const generateToken = (payload: object, expiresIn: any = '7d') => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

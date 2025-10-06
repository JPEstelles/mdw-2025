import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/types';

const SECRET_KEY = process.env.JWT_SECRET!;
const jwtAccessExpiresIn = (process.env.JWT_EXPIRES_IN ?? '15m') as jwt.SignOptions['expiresIn'];
const jwtRefreshSecret= process.env.JWT_REFRESH_SECRET!;

// middleware de autenticación
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
        console.log('Middleware de autenticación');
        console.log('Cookies:', req.cookies);
        const token = req.cookies.accessToken;
        console.log('Token de acceso:', token);
        try{
            jwt.verify(token, SECRET_KEY);
            next();
        } catch (error) {
            validateRefreshToken(req, res, next);
        }
};
const validateRefreshToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken;
    if (!token)
        return res.status(401).json({ message: 'No hay token' });
    try{
        const decoded = jwt.verify(token, jwtRefreshSecret) as JwtPayload;

        const accessToken = jwt.sign({_id: decoded._id}, SECRET_KEY,{
            expiresIn: jwtAccessExpiresIn
        });
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // En producción, usar solo HTTPS
            sameSite: 'lax', 
            maxAge: 60 * 1000 // 1 minuto
        });
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token de actualización no válido' });
    }
};
export default authMiddleware;
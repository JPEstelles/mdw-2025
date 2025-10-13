import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import  dotenv from 'dotenv';
import { JwtPayload } from '../types/types';
import { User } from '../models/userModel'; // AGREGADO: Para obtener info completa del usuario
dotenv.config();
// CORREGIDO: Consistencia en nombres y validación estricta
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error('JWT_SECRET and REFRESH_TOKEN_SECRET must be defined in environment variables');
}

const ACCESS_TOKEN_EXPIRES = (process.env.JWT_EXPIRES_IN ?? '15m') as jwt.SignOptions['expiresIn'];

// CORREGIDO: Función para generar refresh token completo
const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
    // Access token cookie
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutos
    });

    // Refresh token cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });
};

// CORREGIDO: Función para generar payload consistente
const generateTokenPayload = (user: any) => ({
    _id: user._id.toString(),
    username: user.username
});

// Middleware de autenticación - CORREGIDO
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log('Cookies:', req.cookies);
    const token = req.cookies.accessToken;
    console.log('Token de acceso:', token);
    
    // CORREGIDO: Verificar si existe el token primero
    if (!token) {
        return validateRefreshToken(req, res, next);
    }
    
    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
        console.log('JWT decodificado:', decoded);
        (req as any).user = decoded;
        next();
    } catch (error) {
        console.log('Access token inválido, intentando refresh token');
        validateRefreshToken(req, res, next);
    }
};

// CORREGIDO: Token rotation implementado con info completa del usuario
const validateRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
        return res.status(401).json({ message: 'No hay token de autenticación' });
    }
    
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as JwtPayload;
        console.log('Refresh token decodificado:', decoded);

        // CORREGIDO: Obtener información completa del usuario desde la DB
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ 
                message: 'Usuario no encontrado',
                error: 'USER_NOT_FOUND' 
            });
        }

        // CORREGIDO: Usar payload completo con info actualizada del usuario
        const tokenPayload = generateTokenPayload(user);
        
        const newAccessToken = jwt.sign(
            tokenPayload,
            ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRES }
        );

        // CORREGIDO: Implementar token rotation - generar nuevo refresh token
        const newRefreshToken = jwt.sign(
            { _id: user._id.toString() },
            REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        console.log('Nuevos tokens creados con payload completo:', tokenPayload);
        
        // CORREGIDO: Actualizar ambas cookies
        setTokenCookies(res, newAccessToken, newRefreshToken);
        
        // CORREGIDO: Establecer user en request con info completa
        (req as any).user = tokenPayload;
        
        next();
    } catch (error) {
        console.log('Refresh token inválido:', error);
        
        // CORREGIDO: Limpiar cookies inválidas
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        
        return res.status(401).json({ 
            message: 'Token de actualización no válido. Por favor, inicia sesión nuevamente.',
            error: 'REFRESH_TOKEN_EXPIRED' 
        });
    }
};

export default authMiddleware;

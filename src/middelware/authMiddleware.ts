import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// middleware de autenticación
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try{
        // Obtener el token del encabezado de autorización
        const token = req.header('Authorization')?.replace('Bearer ', '');

        //si no hay token
        if (!token) {
            return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
        }

        // Verificar token
        const secret = process.env.JWT_SECRET || 'secret';
        const decoded = jwt.verify(token, secret) as { id: string };

        // Adjuntar el ID del usuario al objeto de la solicitud
        (req as any).userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token de autenticación inválido', error });           
    }
};

export default authMiddleware;
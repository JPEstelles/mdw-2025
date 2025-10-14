import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel';
import { JwtPayload } from '../types/types';

// Variables para los tokens - CORREGIDO: Validación estricta
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error('JWT_SECRET and REFRESH_TOKEN_SECRET must be defined in environment variables');
}

// CORREGIDO: Duración consistente
const ACCESS_TOKEN_EXPIRES = (process.env.JWT_EXPIRES_IN ?? '15m') as jwt.SignOptions['expiresIn'];
const REFRESH_TOKEN_EXPIRES = '7d';

// CORREGIDO: Sincronizar duraciones de cookie con JWT
const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
    // Access token de cookie - CORREGIDO: 15 minutos para coincidir con JWT
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000 // CORREGIDO: 15 minutos en lugar de 10
    });

    // Refresh token de cookie largo
    res.cookie('refreshToken', refreshToken,{
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

// Registro - CORREGIDO
export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        console.log(req.body, 'body aca');

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'El nombre de usuario o email ya está en uso' });
        }
        
        // Crear nuevo usuario
        const user = new User({ username, email, password });
        await user.save();

        // CORREGIDO: Usar función para payload consistente
        const tokenPayload = generateTokenPayload(user);
        
        // Generar tokens
        const accessToken = jwt.sign(
            tokenPayload,
            ACCESS_TOKEN_SECRET,
            {expiresIn: ACCESS_TOKEN_EXPIRES}
        );

        const refreshToken = jwt.sign(
            { _id: user._id.toString() }, // Solo _id para refresh token está bien
            REFRESH_TOKEN_SECRET,
            {expiresIn: REFRESH_TOKEN_EXPIRES}  
        );
        
        // Guardar tokens en cookies
        setTokenCookies(res, accessToken, refreshToken);

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

// Login - CORREGIDO
export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        
        // Verificar si el usuario existe
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Nombre de usuario o contraseña incorrectos' });
        }
        
        // Verificar la contraseña
        const isMatch = await (user as any).comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Nombre de usuario o contraseña incorrectos' });
        }
        
        // CORREGIDO: Usar función para payload consistente
        const tokenPayload = generateTokenPayload(user);
        
        // Generar tokens
        const accessToken = jwt.sign(
            tokenPayload,
            ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRES }
        );

        const refreshToken = jwt.sign(
            { _id: user._id.toString() },
            REFRESH_TOKEN_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRES }
        );
        
        // Guardar tokens en cookies
        setTokenCookies(res, accessToken, refreshToken);

        // CORREGIDO: No devolver el accessToken en la respuesta por seguridad
        return res.status(200).json({
            message: 'Login exitoso',
            user: {
                id: user._id,
                username: user.username
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error en el servidor', error });
    }
};

// Logout - Sin errores, pero mejora agregada
export const logout = (req: Request, res: Response) => {
    try{
        // MEJORA: Opciones específicas para clearCookie
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
        res.status(200).json({ message: 'Logout exitoso' });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel';
import { JwtPayload } from '../types/types';
//variables para los tokens
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'defaultsecret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'defaultsecret';
//Con esto le decís a TS: "Confía en mí, este valor es válido para expiresIn".
const ACCESS_TOKEN_EXPIRES = (process.env.JWT_EXPIRES_IN ?? '15m') as jwt.SignOptions['expiresIn'];
const REFRESH_TOKEN_EXPIRES = '7d';

//interfaz para el payload del jwt


const setTokenCookies = (res: Response, accesToken: string, refreshToken: string) => {
    //acces token de cookie corto
    res.cookie('accessToken', accesToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', //solo en produccion
        sameSite: 'lax', //para evitar ataques CSRF
        maxAge: 10 * 60 * 1000 //10 minutos
    });

    //refresh token de cookie largo
    res.cookie('refreshToken', refreshToken,{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', //solo en produccion
        sameSite: 'lax', //para evitar ataques CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000 //7 dias        
    });
};
    

/* // Función para generar JWT con 1 hora de expiración
const generateToken = (userid: string) => {
    const secret = process.env.JWT_SECRET || 'defaultsecret';
    return jwt.sign({ id: userid }, secret, { expiresIn: '1h' });
}; */
// Registro 
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

        // Generar token
        const accessToken = jwt.sign(
            { _id: user._id.toString(), username: user.username},
            ACCESS_TOKEN_SECRET,
            {expiresIn: ACCESS_TOKEN_EXPIRES}
        );

        const refreshToken = jwt.sign(
            { _id: user._id.toString() },
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

// Login
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
        // Generar token
        const accessToken = jwt.sign(
            { _id: user._id.toString(), username: user.username },
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

        // Retornar respuesta exitosa al usuario
        return res.status(200).json({
            message: 'Login exitoso',
            accessToken: accessToken
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error en el servidor', error });
    }
};
// Logout
export const logout = (req: Request, res: Response) => {
    try{
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Logout exitoso' });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};
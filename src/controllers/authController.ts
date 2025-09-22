import e, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel';

// Función para generar JWT con 1 hora de expiración
const generateToken = (userid: string) => {
    const secret = process.env.JWT_SECRET || 'defaultsecret';
    return jwt.sign({ id: userid }, secret, { expiresIn: '1h' });
};
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
        const token = generateToken(user._id.toString());
        res.status(201).json({
            token,
            expiresIn: '10m',
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
        console.log(req.body, 'body acaaaa');
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
        const token = generateToken(user._id.toString());

        res.status(200).json({
            token,
            expiresIn: '1h',
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
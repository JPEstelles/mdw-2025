"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const userModel_1 = require("../models/userModel"); // AGREGADO: Para obtener info completa del usuario
dotenv_1.default.config();
// CORREGIDO: Consistencia en nombres y validación estricta
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error('JWT_SECRET and REFRESH_TOKEN_SECRET must be defined in environment variables');
}
const ACCESS_TOKEN_EXPIRES = (process.env.JWT_EXPIRES_IN ?? '15m');
// CORREGIDO: Función para generar refresh token completo
const setTokenCookies = (res, accessToken, refreshToken) => {
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
const generateTokenPayload = (user) => ({
    _id: user._id.toString(),
    username: user.username
});
// Middleware de autenticación - CORREGIDO
const authMiddleware = (req, res, next) => {
    console.log('Cookies:', req.cookies);
    const token = req.cookies.accessToken;
    console.log('Token de acceso:', token);
    // CORREGIDO: Verificar si existe el token primero
    if (!token) {
        return validateRefreshToken(req, res, next);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
        console.log('JWT decodificado:', decoded);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.log('Access token inválido, intentando refresh token');
        validateRefreshToken(req, res, next);
    }
};
exports.authMiddleware = authMiddleware;
// CORREGIDO: Token rotation implementado con info completa del usuario
const validateRefreshToken = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'No hay token de autenticación' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_TOKEN_SECRET);
        console.log('Refresh token decodificado:', decoded);
        // CORREGIDO: Obtener información completa del usuario desde la DB
        const user = await userModel_1.User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({
                message: 'Usuario no encontrado',
                error: 'USER_NOT_FOUND'
            });
        }
        // CORREGIDO: Usar payload completo con info actualizada del usuario
        const tokenPayload = generateTokenPayload(user);
        const newAccessToken = jsonwebtoken_1.default.sign(tokenPayload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
        // CORREGIDO: Implementar token rotation - generar nuevo refresh token
        const newRefreshToken = jsonwebtoken_1.default.sign({ _id: user._id.toString() }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        console.log('Nuevos tokens creados con payload completo:', tokenPayload);
        // CORREGIDO: Actualizar ambas cookies
        setTokenCookies(res, newAccessToken, newRefreshToken);
        // CORREGIDO: Establecer user en request con info completa
        req.user = tokenPayload;
        next();
    }
    catch (error) {
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
exports.default = exports.authMiddleware;

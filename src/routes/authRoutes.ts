import express from 'express';
import { register, login, logout } from '../controllers/authController';
import validateDto from '../middelware/middleware';
import { RegisterDto, LoginDto } from '../dtos/authDto';

const router = express.Router();

// Ruta para registrarse
router.post('/register', validateDto(RegisterDto), register);

// Ruta para hacer login
router.post('/login', validateDto(LoginDto), login);

//ruta para logout
router.post('/logout', logout);

export default router;
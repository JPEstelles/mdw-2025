"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const middleware_1 = __importDefault(require("../middelware/middleware"));
const authDto_1 = require("../dtos/authDto");
const router = express_1.default.Router();
// Ruta para registrarse
router.post('/register', (0, middleware_1.default)(authDto_1.RegisterDto), authController_1.register);
// Ruta para hacer login
router.post('/login', (0, middleware_1.default)(authDto_1.LoginDto), authController_1.login);
//ruta para logout
router.post('/logout', authController_1.logout);
exports.default = router;

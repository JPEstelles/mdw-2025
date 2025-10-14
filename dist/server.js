"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
//MMiddleware para parsear cookies
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use('/api/products', productRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/cart', cartRoutes_1.default);
//Middleware de CORS para permitir solicitudes desde el frontend
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true //para las cookies
}));
//Middleware para JSON
app.use(express_1.default.json({ limit: '10mb' })); // seguridad buenas practicas
const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI no está definido en las variables de entorno');
        }
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Conectado a la base de datos MongoDB');
    }
    catch (error) {
        console.error('Error al conectar a la base de datos', error);
        process.exit(1);
    }
};
// Solo inicia el servidor si la conexión es exitosa
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
    });
});

import express from 'express';
import productRoutes from './routes/productRoutes';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cartRoutes from './routes/cartRoutes';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
//MMiddleware para parsear cookies
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
//Middleware de CORS para permitir solicitudes desde el frontend
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true //para las cookies
}));

//Middleware para JSON
app.use(express.json({limit: '10mb'}));// seguridad buenas practicas

const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI no está definido en las variables de entorno');
        }
        await mongoose.connect(MONGODB_URI);
        console.log('Conectado a la base de datos MongoDB');
    } catch (error) {
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
import express from 'express';
import productRoutes from './src/routes/productRoutes.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use('/api/products', productRoutes);


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conectado a la base de datos MongoDB');
    } catch (error) {
        console.error('Error al conectar a la base de datos', error);
        process.exit(1);
    }   
};

app.listen(port, async () => {
    await connectDB();
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

connectDB();
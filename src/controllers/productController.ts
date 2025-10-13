import { Product } from "../models/productModels.ts"
import type { Request, Response } from "express";

// CORREGIDO: Agregar validación de usuario autenticado
interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        username?: string;
    };
}

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
    try { 
        // CORREGIDO: Verificar que el usuario esté autenticado
        if (!req.user) {
            return res.status(401).json({ message: "Usuario no autenticado" });
        }

        // OPCIONAL: Agregar el usuario que creó el producto
        const productData = {
            ...req.body,
            createdBy: req.user._id // Agregar referencia al usuario que lo creó
        };

        const product = new Product(productData);
        await product.save();
        
        res.status(201).json({
            message: "Producto creado exitosamente",
            product: product
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({message: "Error al crear el producto", error});
    }
}

export const getProducts = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // CORREGIDO: Verificar que el usuario esté autenticado
        if (!req.user) {
            return res.status(401).json({ message: "Usuario no autenticado" });
        }

        // OPCIONAL: Agregar paginación
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const products = await Product.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Ordenar por más reciente

        const total = await Product.countDocuments();

        res.status(200).json({
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({message: "Error al obtener los productos", error});
    }
}

export const getProductById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // CORREGIDO: Verificar que el usuario esté autenticado
        if (!req.user) {
            return res.status(401).json({ message: "Usuario no autenticado" });
        }

        // CORREGIDO: Validar formato de ID
        const { id } = req.params;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "ID de producto inválido" });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        
        res.status(200).json({
            message: "Producto encontrado",
            product: product
        });
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({message: "Error al obtener el producto", error});
    }
}

export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // CORREGIDO: Verificar que el usuario esté autenticado
        if (!req.user) {
            return res.status(401).json({ message: "Usuario no autenticado" });
        }

        const { id } = req.params;
        
        // CORREGIDO: Validar formato de ID
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "ID de producto inválido" });
        }

        // CORREGIDO: Validar que hay datos para actualizar
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }

        // OPCIONAL: Agregar información de actualización
        const updateData = {
            ...req.body,
            updatedBy: req.user._id,
            updatedAt: new Date()
        };

        // CORREGIDO: Usar new: true para devolver el documento actualizado
        const updatedProduct = await Product.findByIdAndUpdate(
            id, 
            updateData, 
            { 
                new: true, 
                runValidators: true,
                context: 'query' // Para que funcionen los validators de mongoose
            }
        );
        
        if (!updatedProduct) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        
        res.status(200).json({
            message: "Producto actualizado exitosamente",
            product: updatedProduct
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        
        //  Manejo específico de errores de validación
        if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') {
            return res.status(400).json({
                message: "Error de validación",
                errors: (error as any).errors
            });
        }
        
        res.status(500).json({message: "Error al actualizar el producto", error});
    }
}

export const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // CORREGIDO: Verificar que el usuario esté autenticado
        if (!req.user) {
            return res.status(401).json({ message: "Usuario no autenticado" });
        }

        const { id } = req.params;
        
        // CORREGIDO: Validar formato de ID
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "ID de producto inválido" });
        }

        const deletedProduct = await Product.findByIdAndDelete(id);
        
        if (!deletedProduct) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        
        // CORREGIDO: Mensaje más informativo
        res.status(200).json({ 
            message: "Producto eliminado exitosamente",
            deletedProduct: {
                id: deletedProduct._id,
                name: deletedProduct.name || "Sin nombre",
                deletedBy: req.user._id,
                deletedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({message: "Error al eliminar el producto", error});
    }
}

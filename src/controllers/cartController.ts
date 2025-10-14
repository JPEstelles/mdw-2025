import { Request, Response } from "express";
import { Cart } from "../models/cartModels";
import { Product } from "../models/productModels";

// Obtener el carrito del usuario autenticado
export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id || req.cookies.userId;
        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el carrito", error });
    }
};

// Agregar producto al carrito
export const addToCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id || req.cookies.userId;
        const { productId, quantity } = req.body;

        // Verifica que el producto exista
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Producto no encontrado" });

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Busca si el producto ya está en el carrito
        const itemIndex = cart.items.findIndex((item: any) => item.product.toString() === productId);
        if (itemIndex > -1) {
            // Si ya está, suma la cantidad
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Si no está, lo agrega
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error al agregar al carrito", error });
    }
};

// Quitar producto del carrito
export const removeFromCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id || req.cookies.userId;
        const { productId } = req.body;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

        cart.items.pull({ product: productId });
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error al quitar producto del carrito", error });
    }
};

// Vaciar carrito
export const clearCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id || req.cookies.userId;
        const cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

        cart.items.splice(0, cart.items.length); // <-- Clear array in-place
        await cart.save();
        res.json({ message: "Carrito vaciado" });
    } catch (error) {
        res.status(500).json({ message: "Error al vaciar el carrito", error });
    }
};
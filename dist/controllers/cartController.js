"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.addToCart = exports.getCart = void 0;
const cartModels_1 = require("../models/cartModels");
const productModels_1 = require("../models/productModels");
// Obtener el carrito del usuario autenticado
const getCart = async (req, res) => {
    try {
        const userId = req.user?._id || req.cookies.userId;
        const cart = await cartModels_1.Cart.findOne({ user: userId }).populate("items.product");
        if (!cart)
            return res.status(404).json({ message: "Carrito no encontrado" });
        res.json(cart);
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener el carrito", error });
    }
};
exports.getCart = getCart;
// Agregar producto al carrito
const addToCart = async (req, res) => {
    try {
        const userId = req.user?._id || req.cookies.userId;
        const { productId, quantity } = req.body;
        if (!productId || typeof quantity !== "number" || quantity <= 0) {
            return res.status(400).json({ message: "Datos inválidos para agregar al carrito" });
        }
        // Verifica que el producto exista
        const product = await productModels_1.Product.findById(productId);
        if (!product)
            return res.status(404).json({ message: "Producto no encontrado" });
        let cart = await cartModels_1.Cart.findOne({ user: userId });
        if (!cart) {
            cart = new cartModels_1.Cart({ user: userId, items: [] });
        }
        // Busca si el producto ya está en el carrito
        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
        if (itemIndex > -1) {
            // Si ya está, suma la cantidad
            cart.items[itemIndex].quantity += quantity;
        }
        else {
            // Si no está, lo agrega
            cart.items.push({ product: productId, quantity });
        }
        await recalculateTotal(cart);
        await cart.save();
        res.json(cart);
    }
    catch (error) {
        res.status(500).json({ message: "Error al agregar al carrito", error });
    }
};
exports.addToCart = addToCart;
// Quitar producto del carrito
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user?._id || req.cookies.userId;
        const { productId } = req.body;
        const cart = await cartModels_1.Cart.findOne({ user: userId });
        if (!cart)
            return res.status(404).json({ message: "Carrito no encontrado" });
        cart.items.pull({ product: productId });
        await recalculateTotal(cart);
        await cart.save();
        res.json(cart);
    }
    catch (error) {
        res.status(500).json({ message: "Error al quitar producto del carrito", error });
    }
};
exports.removeFromCart = removeFromCart;
// Vaciar carrito
const clearCart = async (req, res) => {
    try {
        const userId = req.user?._id || req.cookies.userId;
        const cart = await cartModels_1.Cart.findOne({ user: userId });
        if (!cart)
            return res.status(404).json({ message: "Carrito no encontrado" });
        cart.items.splice(0, cart.items.length); // <-- Clear array in-place
        await cart.save();
        res.json({ message: "Carrito vaciado" });
    }
    catch (error) {
        res.status(500).json({ message: "Error al vaciar el carrito", error });
    }
};
exports.clearCart = clearCart;
async function recalculateTotal(cart) {
    // Popula los productos para acceder a su precio
    await cart.populate("items.product");
    cart.totalPrice = cart.items.reduce((sum, item) => {
        return sum + (item.product?.price || 0) * item.quantity;
    }, 0);
}

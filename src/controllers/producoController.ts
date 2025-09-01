import { Producto } from "../models/productModels"

export const createProduct = async (req, res) => {
    try { 
        const product = new Producto(req.body);
        await product.save();
        res.status(201).send(product);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const getProducts = async (req, res) => {
    try {
        const products = await Producto.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const getProductById = async (req, res) => {
    try {
        const product = await Producto.findById(req.params.id);
        if (!product) return res.status(404).json({message: "Producto no Encontrado"});
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await Producto.findByIdAndUpdate(id, req.body);
        if (!updatedProduct) return res.status(404).json({message: "Producto no Encontrado"});
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Producto.findByIdAndDelete(id);
        if (!deletedProduct) return res.status(404).json({message: "Producto no Encontrado"});
        res.status(200).json(deletedProduct);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

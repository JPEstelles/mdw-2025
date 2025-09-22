import { Product } from "../models/productModels.ts"
import type { Request, Response } from "express";

export const createProduct = async (req: Request, res: Response) => {
    try { 
        const product = new Product(req.body);
        await product.save();
        res.status(201).send(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({message:" Error al crear el producto", error} );
    }
}

export const getProducts =  async (req: Request, res: Response) => {
    try {
        console.log("Fetching all products");
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({message: "Error al obtener los productos", error} );
    }
}

export const getProductById =  async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({message: "Producto no Encontrado"});
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({message: "Error al obtener el producto", error} );
    }
}
export const updateProduct = async  (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body);
        if (!updatedProduct) return res.status(404).json({message: "Producto no Encontrado"});
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({message: "Error al actualizar el producto", error} );
    }
}
export const deleteProduct = async  (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) return res.status(404).json({message: "Producto no Encontrado"});
        res.status(200).json(deletedProduct);
    } catch (error) {
        res.status(500).json({message: "Error al eliminar el producto", error} );
    }
}

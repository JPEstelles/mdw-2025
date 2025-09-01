import { createProduct, getProductById, getProducts,deleteProduct, updateProduct } from "../controllers/productController.js";
import express from "express";
const router = express.Router();

router.post('/', createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
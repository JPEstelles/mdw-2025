import { createProduct, getProductById, getProducts,deleteProduct, updateProduct } from "../controllers/producoController";
import express from "express";
const router = express.Router();

router.post('/products', createProduct);
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

export default router;
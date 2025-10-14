import { createProduct, getProductById, getProducts,deleteProduct, updateProduct } from "../controllers/productController";
import express from "express";
import validateDto from "../middelware/middleware";
import { CreateProductDto } from "../dtos/createProductDto";
import { authMiddleware } from "../middelware/authMiddleware";

const router = express.Router();

// TODAS las rutas requieren JWT
router.use(authMiddleware);

router.post("/", validateDto(CreateProductDto), createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;

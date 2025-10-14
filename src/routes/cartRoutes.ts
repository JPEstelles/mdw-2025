import express from "express";
import validateDto from "../middelware/middleware.ts";
import { CreateProductDto } from "../dtos/createProductDto.ts";
import { authMiddleware } from "../middelware/authMiddleware";
import { addToCart, getCart, removeFromCart } from "../controllers/cartController";
import { clear } from "console";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getCart);
router.post("/add", addToCart);
router.post("/remove", removeFromCart);
router.post("/clear", clear);

export default router;

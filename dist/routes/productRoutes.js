"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const productController_1 = require("../controllers/productController");
const express_1 = __importDefault(require("express"));
const middleware_1 = __importDefault(require("../middelware/middleware"));
const createProductDto_1 = require("../dtos/createProductDto");
const authMiddleware_1 = require("../middelware/authMiddleware");
const router = express_1.default.Router();
// TODAS las rutas requieren JWT
router.use(authMiddleware_1.authMiddleware);
router.post("/", (0, middleware_1.default)(createProductDto_1.CreateProductDto), productController_1.createProduct);
router.get('/', productController_1.getProducts);
router.get('/:id', productController_1.getProductById);
router.put('/:id', productController_1.updateProduct);
router.delete('/:id', productController_1.deleteProduct);
exports.default = router;

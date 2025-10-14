"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middelware/authMiddleware");
const cartController_1 = require("../controllers/cartController");
const console_1 = require("console");
const router = express_1.default.Router();
router.use(authMiddleware_1.authMiddleware);
router.get("/", cartController_1.getCart);
router.post("/add", cartController_1.addToCart);
router.post("/remove", cartController_1.removeFromCart);
router.post("/clear", console_1.clear);
exports.default = router;

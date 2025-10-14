"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDto = validateDto;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
function validateDto(dtoClass) {
    return async (req, res, next) => {
        const dtoObj = (0, class_transformer_1.plainToInstance)(dtoClass, req.body);
        const errors = await (0, class_validator_1.validate)(dtoObj);
        if (errors.length > 0) {
            return res.status(400).json({
                message: "Datos inválidos",
                errors: errors.map(e => e.constraints),
            });
        }
        next();
    };
}
exports.default = validateDto;

import { IsString, IsNumber, Min, MaxLength, MinLength, IsNotEmpty, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, Validate } from "class-validator";

import { Product } from "../models/productModels";

// Validador personalizado para nombre único
@ValidatorConstraint({ async: true })
export class IsProductNameUnique implements ValidatorConstraintInterface {
  async validate(name: string) {
    console.log("Validando nombre único:", name);
    const product = await Product.findOne({ name });
    return !product;
  }
  defaultMessage(args?: ValidationArguments) {
    return "El nombre del producto ya existe. Por favor, elige otro nombre.";
  }
}
export class CreateProductDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  @Validate(IsProductNameUnique)
  name!: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MinLength(5, { message: 'La descripción debe tener al menos 5 caracteres' })
  @MaxLength(1000, { message: 'La descripción no puede tener más de 1000 caracteres' })
  description!: string;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price!: number;

  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock!: number;

  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @MaxLength(100, { message: 'La categoría no puede tener más de 100 caracteres' })
  category!: string;
}
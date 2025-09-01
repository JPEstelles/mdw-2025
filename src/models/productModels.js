import mongoose from "mongoose";

const productschema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        maxlength: 100
    },
    description:
    {
        type:String,
        required: true,
        maxlength: 1000
    },
    price:
    {
        type:Number,
        required: true,
        min: 0
    }
})

export const Producto = mongoose.model('Product', productschema);
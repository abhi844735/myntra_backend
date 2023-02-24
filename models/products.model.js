const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
    title: { type: String, required: true },
    image_1: { type: String, required: true },
    image_2: { type: String, required: true },
    image_3: { type: String, required: true },
    image_4: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "both"], default: "both" },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    color: String,
    brand: { type: String, required: true },
    discount: { type: Number, default: 0 }
})

const ProductModel = mongoose.model("product", ProductSchema);

module.exports = {
    ProductModel
}
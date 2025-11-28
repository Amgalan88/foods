import mongoose from "mongoose";
const { Schema, model } = mongoose;

const FoodSchema = new Schema(
  {
    foodname: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    price: Number,
    ingredients: String,
    image: { type: String, trim: true },
  },
  { versionKey: false }
);

export default model("Food", FoodSchema); // 👈 ref: "Food"

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ItemSchema = new Schema(
  {
    food: { type: Schema.Types.ObjectId, ref: "Food", required: true },
    quantity: { type: Number, min: 1, default: 1 },
    price: { type: Number, min: 0, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: {
      type: [ItemSchema],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    deliveryAddress: { type: String, trim: true },
    totalPrice: { type: Number, min: 0, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "preparing", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false }
);

export default model("Order", OrderSchema); // 👈 ref: "Order"

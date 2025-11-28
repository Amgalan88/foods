import mongoose from "mongoose";
import Order from "../../models/ordermodel.js";
import Food from "../../models/foodmodel.js";
import { ORDER_STATUSES } from "./order-status.js";

export const createOrder = async (req, res) => {
  try {
    const { items, status, deliveryAddress } = req.body;
    const userId = req.user?.id || req.body.user;

    // — 1. шалгалтууд
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "user буруу ID" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items хоосон байж болохгүй" });
    }
    const cleanItemIds = [];
    for (const it of items) {
      if (!it?.food || !mongoose.isValidObjectId(it.food)) {
        return res.status(400).json({ message: "items[*].food буруу ID" });
      }
      cleanItemIds.push(it.food);
    }

    const foods = await Food.find({ _id: { $in: cleanItemIds } }).lean();
    if (foods.length !== cleanItemIds.length) {
      return res.status(400).json({ message: "Хоолын мэдээлэл буруу байна" });
    }

    const foodMap = foods.reduce((acc, food) => {
      acc.set(food._id.toString(), food);
      return acc;
    }, new Map());

    let missingFood = null;
    const cleanItems = items.map((it) => {
      const foodDoc = foodMap.get(it.food.toString());
      if (!foodDoc) {
        missingFood = it.food;
        return null;
      }
      const quantity = Math.max(1, Number(it.quantity) || 1);
      const price = Number(foodDoc?.price) || 0;
      return {
        food: foodDoc._id,
        quantity,
        price,
      };
    });

    if (missingFood) {
      return res.status(400).json({ message: "Ийм хоол олдсонгүй" });
    }

    const totalPrice = cleanItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: userId,
      items: cleanItems,
      status: ORDER_STATUSES.includes(status) ? status : "pending",
      deliveryAddress,
      totalPrice,
    });

    // — 3. populate хийхдээ model тодорхой заах нь чухал
    const populated = await Order.findById(order._id)
      .populate("user", "name email phone")
      .populate({
        path: "items.food",
      });

    return res.status(201).json(populated);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res
        .status(422)
        .json({ message: "Буруу өгөгдөл", errors: err.errors });
    }
    return res
      .status(500)
      .json({ message: "Алдаа гарлаа", error: err.message });
  }
};

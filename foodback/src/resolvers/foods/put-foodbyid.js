import { isValidObjectId } from "mongoose";
import Food from "../../models/foodmodel.js";

export const updateFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid food ID" });
    }

    const payload = req.body ?? {};
    const update = {};

    if (typeof payload.foodname === "string") {
      update.foodname = payload.foodname.trim();
    }
    if (typeof payload.price !== "undefined") {
      update.price = Number(payload.price);
    }
    if (typeof payload.ingredients === "string") {
      update.ingredients = payload.ingredients;
    }
    if (typeof payload.image === "string") {
      update.image = payload.image;
    }
    if (payload.category && isValidObjectId(payload.category)) {
      update.category = payload.category;
    }

    const updated = await Food.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update food", error: err.message });
  }
};

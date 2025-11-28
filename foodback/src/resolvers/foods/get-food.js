import { isValidObjectId } from "mongoose";
import Food from "../../models/foodmodel.js";

export const getFood = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId) {
      return res.status(400).json({ message: "id oldsongvi" });
    }

    const doc = await Food.findById(id);

    if (!doc) res.status(404).json({ message: "aldaa garlaa" });

    res.status(200).json(Food);
  } catch (err) {
    res.status(500).json({ message: "aldaa garlaa" });
  }
};

import { isValidObjectId } from "mongoose";
import Category from "../../models/categorymodel.js";

export const getCategorybyid = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "buruu id" });
    }
    const doc = await Category.findById(id).select("category _id");

    if (!doc) return res.status(404).json({ message: "olsongvi" });

    res.status(200).json(doc);
  } catch (err) {
    res.status(500).json({ message: "aldaa garlaa", error: err.message });
  }
};

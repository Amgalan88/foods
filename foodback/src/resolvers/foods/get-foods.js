import Food from "../../models/foodmodel.js";

export const getFoods = async (req, res) => {
  try {
    const foods = await Food.find().populate("category", "category _id");
    res.status(200).json(foods);
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа", error: err.message });
  }
};

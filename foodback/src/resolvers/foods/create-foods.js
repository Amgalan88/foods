import Food from "../../models/foodmodel.js";

export const createFood = async (req, res) => {
  try {
    const created = await Food.create(req.body);
    res.status(200).json(created);
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа", error: err.message });
  }
};

// src/resolvers/foods/get-foodbyid.js
import Food from "../../models/foodmodel.js";

export const getFoodByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log("➡ GET /foods/category/", categoryId);

    // 👇 Category-р шүүж бүх хоолыг аваад category field-ийг populate хийж байна
    const foods = await Food.find({ category: categoryId }).populate(
      "category",
      "category"
    );

    // ❗ Хоосон байсан ч 404 биш, зүгээр [] буцаана
    return res.json(foods);
  } catch (err) {
    console.error("getFoodByCategoryId error:", err);
    return res.status(500).json({
      message: "Алдаа гарлаа",
      error: err.message,
    });
  }
};

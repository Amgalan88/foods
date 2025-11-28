import Category from "../../models/categorymodel.js";

export const createCategory = async (req, res) => {
  try {
    const createdcategory = await Category.create(req.body);

    res.status(200).json(createdcategory);
  } catch (err) {
    res.status(500).json({ message: "aldaa garlaa", error: err.message });
  }
};

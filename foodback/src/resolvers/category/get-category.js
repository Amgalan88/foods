import Category from "../../models/categorymodel.js";

export const getCategory = async (req, res) => {
  try {
    const getedcategory = await Category.find();

    res.status(200).json(getedcategory);
  } catch (err) {
    res.status(500).json({ message: "aldaa garlaa", error: err.message });
  }
};

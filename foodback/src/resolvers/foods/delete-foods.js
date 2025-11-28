import mongoose from "mongoose";
import Food from "../../models/foodmodel.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Буруу ID" });
    }

    const deleted = await Food.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Ийм хоол/бичлэг олдсонгүй" });
    }

    return res.status(200).json({ message: "Устгалаа", id: deleted._id });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Алдаа гарлаа", error: err.message });
  }
};

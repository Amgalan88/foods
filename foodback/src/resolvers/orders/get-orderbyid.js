import { isValidObjectId } from "mongoose";
import Order from "../../models/ordermodel.js";

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "aldaa id oldsongvi" });
    }
    const doc = await Order.findById(id);

    if (!doc) {
      return res.status(404).json({ message: "olsongvi" });
    }

    res.status(200).json(doc);
  } catch (err) {
    res.status(500).json({ message: "aldaa garlaa" });
  }
};

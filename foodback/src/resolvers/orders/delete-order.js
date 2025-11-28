import Order from "../../models/ordermodel.js";

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Order.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Ийм хэрэглэгч олдсонгүй" });
    }
    res.status(200).json({ message: "Устгалаа" });
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа", error: err.message });
  }
};

import { isValidObjectId } from "mongoose";
import Order from "../../models/ordermodel.js";
import { ORDER_STATUSES } from "./order-status.js";

export const updateOrder = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Буруу order ID" });
  }

  const { status, deliveryAddress } = req.body ?? {};
  const updates = {};

  if (status) {
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Алдаатай статус" });
    }
    updates.status = status;
  }

  if (typeof deliveryAddress === "string") {
    updates.deliveryAddress = deliveryAddress.trim();
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: "Шинэчлэх өгөгдөл алга байна" });
  }

  try {
    const updated = await Order.findByIdAndUpdate(id, updates, {
      new: true,
    })
      .populate("user", "name email phone")
      .populate({
        path: "items.food",
        select: "foodname price category ingredients image",
        populate: { path: "category" },
      });

    if (!updated) {
      return res.status(404).json({ message: "Захиалга олдсонгүй" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Шинэчлэх үед алдаа гарлаа", error: err.message });
  }
};

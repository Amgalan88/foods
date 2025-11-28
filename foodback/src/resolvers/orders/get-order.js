import { isValidObjectId } from "mongoose";
import Order from "../../models/ordermodel.js";
import { ORDER_STATUSES } from "./order-status.js";

export const getOrders = async (req, res) => {
  try {
    const { status, from, to } = req.query ?? {};
    const query = {};

    if (req.user?.role !== "admin") {
      query.user = req.user.id;
    }

    if (status && ORDER_STATUSES.includes(status)) {
      query.status = status;
    }

    if (from || to) {
      query.createdAt = {};

      if (from) {
        const fromDate = new Date(from);
        if (!Number.isNaN(fromDate.valueOf())) {
          query.createdAt.$gte = fromDate;
        }
      }

      if (to) {
        const toDate = new Date(to);
        if (!Number.isNaN(toDate.valueOf())) {
          query.createdAt.$lte = toDate;
        }
      }

      if (!Object.keys(query.createdAt).length) {
        delete query.createdAt;
      }
    }

    const orders = await Order.find(query)
      .sort("-createdAt")
      .populate("user", "name email phone")
      .populate({
        path: "items.food",
        select: "foodname price category ingredients image",
        populate: { path: "category" },
      });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа", error: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Буруу ID" });
    }

    const order = await Order.findById(id)
      .populate("user", "name email phone -_id")
      .populate({
        path: "items.food",
        select: "foodname price category ingredients -_id",
      });

    if (!order) return res.status(404).json({ message: "Олдсонгүй" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа", error: err.message });
  }
};

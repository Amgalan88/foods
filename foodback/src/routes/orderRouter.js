import express from "express";
import { createOrder } from "../resolvers/orders/create-order.js";
import { getOrders, getOrderById } from "../resolvers/orders/get-order.js";
import { deleteOrder } from "../resolvers/orders/delete-order.js";
import { updateOrder } from "../resolvers/orders/update-order.js";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.use(authenticate);
orderRouter.post("/", createOrder);
orderRouter.get("/", getOrders);
orderRouter.get("/:id", authorizeAdmin, getOrderById);
orderRouter.patch("/:id", authorizeAdmin, updateOrder);
orderRouter.delete("/:id", authorizeAdmin, deleteOrder);

export default orderRouter;

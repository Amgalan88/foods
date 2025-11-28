import express from "express";
import mongoose from "mongoose";
import cors from "cors"; //  ← CORS импорт заавал хэрэгтэй!!

import userRouter from "./src/routes/userRouter.js";
import foodRouter from "./src/routes/foodRouter.js";
import orderRouter from "./src/routes/orderRouter.js";
import categoryRouter from "./src/routes/categoryRouter.js";
import User from "./src/models/usermodel.js";

const app = express();
const PORT = 8000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "masteradmin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "88080888";
const ADMIN_NAME = process.env.ADMIN_NAME || "Master Admin";

const ensureDefaultAdmin = async () => {
  const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });

  if (!existing) {
    await User.create({
      name: ADMIN_NAME,
      email: normalizedEmail,
      password: ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(`👤 Created default admin: ${normalizedEmail}`);
    return;
  }

  const updates = {};
  if (existing.role !== "admin") {
    updates.role = "admin";
  }
  if (existing.password !== ADMIN_PASSWORD) {
    updates.password = ADMIN_PASSWORD;
  }
  if (!existing.name) {
    updates.name = ADMIN_NAME;
  }

  if (Object.keys(updates).length) {
    await User.updateOne({ _id: existing._id }, updates);
    console.log(`👤 Updated default admin credentials for ${normalizedEmail}`);
  } else {
    console.log(`👤 Admin credentials ready for ${normalizedEmail}`);
  }
};

// --- Middlewares ---
app.use(cors({ origin: "*" })); // эсвэл зөв домэйн зааж болно
app.use(express.json());

// --- Routes ---
app.use("/users", userRouter);
app.use("/foods", foodRouter);
app.use("/orders", orderRouter);
app.use("/category", categoryRouter);

// MongoDB URI
const MONGO_URI = "mongodb+srv://matirx77:Amgaa0717@foods.c1jiald.mongodb.net/";

// --- MongoDB connect + Server run ---
try {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");
  await ensureDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`Server is running on ➜  http://localhost:${PORT}`);
  });
} catch (err) {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1);
}

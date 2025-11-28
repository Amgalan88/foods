import express from "express";
import { getCategory } from "../resolvers/category/get-category.js";
import { createCategory } from "../resolvers/category/create-category.js";
import { getCategorybyid } from "../resolvers/category/get-categorybyid.js";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";

const categoryRouter = express.Router();

categoryRouter.get("/", getCategory);
categoryRouter.get("/:id", getCategorybyid);
categoryRouter.post("/", authenticate, authorizeAdmin, createCategory);

export default categoryRouter;

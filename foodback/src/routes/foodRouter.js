import express from "express";

import { getFoods } from "../resolvers/foods/get-foods.js";
import { createFood } from "../resolvers/foods/create-foods.js";
import { deleteFood } from "../resolvers/foods/delete-foods.js";
import { getFoodByCategoryId } from "../resolvers/foods/get-foodbyid.js";
import { getFood } from "../resolvers/foods/get-food.js";
import { updateFoodById } from "../resolvers/foods/put-foodbyid.js";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";

const foodRouter = express.Router();

foodRouter.get("/", getFoods);
foodRouter.post("/", authenticate, authorizeAdmin, createFood);
foodRouter.delete("/:id", authenticate, authorizeAdmin, deleteFood);
foodRouter.put("/:id", authenticate, authorizeAdmin, updateFoodById);
foodRouter.get("/category/:categoryId", getFoodByCategoryId);
foodRouter.get("/:id", getFood);

export default foodRouter;

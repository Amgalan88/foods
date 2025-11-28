// src/routes/userRouter.js
import express from "express";
import { getUser } from "../resolvers/users/get-users.js";
import { createUser } from "../resolvers/users/create-user.js";
import { updateUser } from "../resolvers/users/update-user.js";
import { deleteUser } from "../resolvers/users/delete-user.js";
import { getUserById } from "../resolvers/users/get-userbyid.js";
import { loginUser } from "../resolvers/users/login-user.js";

const userRouter = express.Router();

userRouter.get("/", getUser); // GET /users
userRouter.get("/:id", getUserById); // GET /users:id
userRouter.post("/", createUser); // POST /users
userRouter.post("/login", loginUser); // POST /users/login
userRouter.put("/:id", updateUser); // PUT /users/:id
userRouter.delete("/:id", deleteUser); // DELETE /users/:id

export default userRouter;

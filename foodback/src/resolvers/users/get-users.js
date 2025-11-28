// src/resolvers/users/get-users.js
import User from "../../models/usermodel.js";

export const getUser = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа", error: err.message });
  }
};

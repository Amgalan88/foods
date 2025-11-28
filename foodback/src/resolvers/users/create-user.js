import User from "../../models/usermodel.js";

export const createUser = async (req, res) => {
  try {
    const payload = req.body ?? {};
    if (!payload.role) {
      payload.role = "user";
    }
    const created = await User.create(payload);
    const userObj = created.toObject();
    delete userObj.password;
    res.status(201).json(userObj);
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа", error: err.message });
  }
};

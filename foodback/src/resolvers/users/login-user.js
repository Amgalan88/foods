import User from "../../models/usermodel.js";
import { signUserToken } from "../../middleware/auth.js";

export const loginUser = async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required to sign in." });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail }).lean();

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.password && user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.password) {
      await User.updateOne({ _id: user._id }, { password });
      user = { ...user, password };
    }

    const { password: _pw, ...safeUser } = user;
    const token = signUserToken(safeUser);

    res.status(200).json({ user: safeUser, token });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to log in user.", error: err.message });
  }
};

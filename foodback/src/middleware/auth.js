import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "nomnom_dev_secret";

export const signUserToken = (user) => {
  const payload = {
    id: user._id?.toString(),
    email: user.email,
    role: user.role || "user",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
};

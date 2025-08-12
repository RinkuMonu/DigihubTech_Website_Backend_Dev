import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const isAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized. Token missing or invalid." });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Unauthorized. Invalid token." });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === "super-admin" || user.role === 'admin' || user.role === "vendor") {
      req.user = user;
      next(); // Proceed to the next middleware or route handler
      return;
    }
    return res.status(403).json({ message: "Access denied. Admins only." });
  } catch (error) {
    console.error("Error verifying super-admin:", error.message);
    res.status(401).json({ message: "User not authorized", error: error.message });
  }
};

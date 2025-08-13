import express from "express";
import cors from "cors";
import { DBConnection } from "./src/db.js";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import orderRoutes from "./src/routes/order.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import websiteRoutes from "./src/routes/website.routes.js";
import cartRoutes from "./src/routes/cart.routes.js";
import wishlistRoutes from "./src/routes/wishlist.routes.js";
import catergoriesRoutes from "./src/routes/category.routes.js";
import policyRoutes from "./src/routes/policy.routes.js";

import { phonePeController } from "./src/routes/payment.routes.js";
import { getDashboardData } from "./src/routes/dashboard.routes.js";
import { fileURLToPath } from "url";
import vendorRoutes from "./src/routes/vendor.routes.js";
import { isAdmin } from "./src/middleware/isAdmin.js";
import bannerRoutes from "./src/routes/banner.rotes.js";
import review from "./src/routes/review.route.js";
import "./cron.js";
import brandRoutes from "./src/routes/brand.route.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5008;

// app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// app.use(cors({ origin: '*' }));

app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://localhost:5008",
      "http://localhost:4002",
      "http://localhost:4003",
      "http://localhost:4005",
      "http://localhost:4004",
      "https://yourfrontenddomain.com",
      "https://jajamblockprints.com",
      "https://admin.jajamblockprints.com",
      "https://slsxt366-4002.inc1.devtunnels.ms/",
      "https://admin.digihubtech.in",
      "https://website.digihubtech.in",
    ], // allow specific frontend domains
    credentials: true, // allow cookies and headers like Authorization
  })
);

app.use("/uploads", express.static(path.join(__dirname, "./src/uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/website", websiteRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/categories", catergoriesRoutes);
app.use("/api/product", productRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/policy", policyRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/sendreview", review);
app.use("/api/brand", brandRoutes);

app.post("/api/phonepe-payment", phonePeController);
app.get("/api/dashboard", isAdmin, getDashboardData);
app.use("/api", vendorRoutes);

// 67888fb90e1c6b678401302d

DBConnection();

app.get("/", (req, res) => {
  res.send("server running well");
});

app.use((err, req, res, next) => {
  console.error("Error occurred: ", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ message }); // Respond with the error message
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

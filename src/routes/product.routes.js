import express from "express";
import {
  createMultipleProducts,
  createProduct,
  deleteProduct,
  getProductDetail,
  getProducts,
  updateProduct,
  setDealOfTheDay,
  getDealsOfTheDay,
  applyCouponOnProduct,
} from "../controller/Product.controller.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { verifyToken } from "../middleware/verifyToken.js";
import upload from "../middleware/multerConfig.js";

const productRoutes = express.Router();

// productRoutes.post(
//   "/products",
//   isAdmin,
//   upload.array("images", 5), // up to 5 images
//   createProduct
// );
productRoutes.post(
  "/products",
  isAdmin,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "variantImages_0", maxCount: 5 },
    { name: "variantImages_1", maxCount: 5 },
    { name: "variantImages_2", maxCount: 5 },
  ]),
  createProduct
);

productRoutes.get("/getproducts", getProducts);
productRoutes.get("/getproduct/:id", getProductDetail);

productRoutes.delete("/delete/:id", isAdmin, deleteProduct);
productRoutes.put(
  "/products/:id",
  isAdmin,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "variantImages_0", maxCount: 5 },
    { name: "variantImages_1", maxCount: 5 },
    { name: "variantImages_2", maxCount: 5 },
  ]),
  updateProduct
);

productRoutes.post("/addmany", createMultipleProducts);
productRoutes.post("/dealoftheday", setDealOfTheDay);
productRoutes.get("/getdeals", getDealsOfTheDay);

// add-coupon 
productRoutes.put("/apply-coupon/:id", applyCouponOnProduct);

export default productRoutes;

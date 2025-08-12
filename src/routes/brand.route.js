import express from "express";
import { isAdmin } from "../middleware/isAdmin.js";
import upload from "../middleware/multerConfig.js";
import {
  createBrand,
  deleteBrand,
  getBrandById,
  getBrands,
  updateBrand,
} from "../controller/brand.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const brandRoutes = express.Router();

brandRoutes.post(
  "/createBrand",
  verifyToken,
  isAdmin,
  upload.array("logo", 5),
  createBrand
);

brandRoutes.get("/getbrand", getBrands);
brandRoutes.get("/getbrandId/:id", getBrandById);

brandRoutes.delete("/brandDelete/:id", isAdmin, deleteBrand);
brandRoutes.put(
  "/updateBrand/:id",
  isAdmin,
  upload.single("logo"),
  updateBrand
);

export default brandRoutes;

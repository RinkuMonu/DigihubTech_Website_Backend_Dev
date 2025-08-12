import express from "express";
import {
  createBanner,
  createMultipleBanners,
  deleteBanner,
  getBannerDetail,
  getBanners,
  getBannersByWebsiteAndPosition,
  getDestopBanners,
  getMobileBanners,
  updateBanner,
} from "../controller/Banner.controller.js";
import upload from "../middleware/multerConfig.js";


const bannerRoutes = express.Router();

// Create a single banner (admin only)
bannerRoutes.post(
  "/create",
  
   upload.array('images', 5), // upload max 5 images
  createBanner
);

// Create multiple banners (admin only)
bannerRoutes.post(
  "/bulk-create",


  createMultipleBanners
);
bannerRoutes.get("/by-website-and-position", getBannersByWebsiteAndPosition);

bannerRoutes.get("/mobile", getMobileBanners); // new
bannerRoutes.get("/desktop", getDestopBanners); // new
// Get banners (public or protected depending on app logic)
bannerRoutes.get("/", getBanners);

// Get a single banner by ID
bannerRoutes.get("/:id", getBannerDetail);

// Update a banner (admin only)
bannerRoutes.put(
  "/:id",
 
  upload.array("images", 5),
  updateBanner
);

// Delete a banner (admin only)
bannerRoutes.delete("/:id", deleteBanner);

export default bannerRoutes;
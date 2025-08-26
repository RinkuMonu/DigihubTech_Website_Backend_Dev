import express from "express";
import { applyCoupon, createCoupon, getCouponById, updateCoupon, deleteCoupon, getCoupons } from "../controller/coupon.controller.js";


const router = express.Router();

// ✅ Create new coupon
router.post("/", createCoupon);

// ✅ Apply coupon (user/product ke base pe validate hoga)
router.post("/apply", applyCoupon);

// ✅ Get all coupons
router.get("/", getCoupons);

// ✅ Get single coupon
router.get("/:id", getCouponById);

// ✅ Update coupon
router.put("/:id", updateCoupon);

// ✅ Delete coupon
router.delete("/:id", deleteCoupon);

export default router;

import Coupon from "../models/coupon.model.js";
import User from "../models/User.model.js";
import Product from "../models/Product.model.js";

// ✅ Create Coupon
export const createCoupon = async (req, res) => {
    try {
        const {
            code,
            discountType,
            discountValue,
            expiryDate,
            applicableTo,
            startDate, minimumOrderValue,
            applicableProducts,
            applicableUsers,
            usageLimit,
        } = req.body;

        const coupon = new Coupon({
            code,
            discountType, // "percentage" | "fixed"
            discountValue,
            expiryDate,
            applicableTo, // "product" | "user"
            applicableProducts,
            startDate, minimumOrderValue,
            applicableUsers,
            usageLimit,
        });

        await coupon.save();
        res.status(201).json({ success: true, coupon });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ Apply Coupon
export const applyCoupon = async (req, res) => {
    try {
        const { code, userId, productId } = req.body;

        const coupon = await Coupon.findOne({ code });
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Invalid coupon" });
        }

        // Check expiry
        if (new Date() > new Date(coupon.expiryDate)) {
            return res.status(400).json({ success: false, message: "Coupon expired" });
        }

        // Check usage limit
        if (coupon.usageLimit <= coupon.usageCount) {
            return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
        }

        // Apply condition based on applicableTo
        // if (coupon.applicableTo === "user") {
        //     if (!coupon.applicableUsers.includes(userId)) {
        //         return res.status(400).json({ success: false, message: "Coupon not valid for this user" });
        //     }
        // }

        const alreadyUsed = coupon.userUsage.some(u => u.user.toString() === userId);
        if (alreadyUsed) {
            return res.status(400).json({ success: false, message: "You have already used this coupon" });
        }

        if (!coupon.applicableProducts.includes(productId)) {
            return res.status(400).json({ success: false, message: "Coupon not valid for this product" });
        }


        // ✅ Increase usage count
        coupon.totalUsed += 1;
        coupon.userUsage.push({ userId });
        await coupon.save();

        // Apply discount (example: calculate new price)
        let discountInfo = {};
        if (coupon.discountType === "percentage") {
            discountInfo = {
                type: "percentage",
                value: coupon.discountValue,
                message: `${coupon.discountValue}% discount applied!`,
            };
        } else {
            discountInfo = {
                type: "fixed",
                value: coupon.discountValue,
                message: `${coupon.discountValue}₹ discount applied!`,
            };
        }

        res.json({ success: true, message: "Coupon applied successfully", discount: discountInfo });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ Get All Coupons
export const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.json({ success: true, coupons });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ Get Single Coupon
export const getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }
        res.json({ success: true, coupon });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ Update Coupon
export const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }
        res.json({ success: true, coupon });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ Delete Coupon
export const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }
        res.json({ success: true, message: "Coupon deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

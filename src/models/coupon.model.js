import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },
        discountType: {
            type: String,
            enum: ["percentage", "fixed"], // % ya fixed amount
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
        },
        minimumOrderValue: {
            type: Number,
            default: 0, // optional
        },
        startDate: {
            type: Date,
            required: true,
        },
        expiryDate: {
            type: Date,
            required: true,
        },

        // ✅ Coupon kis product par valid hai
        applicableProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],

        // ✅ Coupon kis user ke liye valid hai
        applicableUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // ✅ Limit control
        usageLimit: {
            type: Number,
            default: 1, // max total times coupon can be used
        },
        perUserLimit: {
            type: Number,
            default: 1, // ek user max kitni baar use kar sakta hai
        },

        // ✅ Track total usage
        totalUsed: {
            type: Number,
            default: 0,
        },

        // ✅ Track per user usage
        userUsage: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                state: { type: String, enum: ["applied", "used"], default: "applied" },
                appliedAt: { type: Date, default: Date.now },
                usedAt: { type: Date },
            },
        ],

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);

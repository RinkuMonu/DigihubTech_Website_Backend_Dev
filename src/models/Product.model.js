
import mongoose from "mongoose";

const Money = {
  mrp: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "INR" },
};

const Weight = {
  value: { type: Number, min: 0 },
  unit: { type: String, enum: ["g", "kg"], default: "g" },
};

const Dimensions = {
  l: { type: Number, min: 0 },
  w: { type: Number, min: 0 },
  h: { type: Number, min: 0 },
  unit: { type: String, enum: ["cm", "in"], default: "cm" },
};

const ReturnPolicy = {
  eligible: { type: Boolean, default: true },
  days: { type: Number, default: 7 },
};

const Warranty = {
  type: {
    type: String,
    enum: ["No Warranty", "Seller", "Manufacturer", "International"],
    default: "Manufacturer",
  },
  durationMonths: { type: Number, default: 0 },
};

const Tax = {
  hsn: { type: String, trim: true }, // e.g., "8517"
  gstRate: { type: Number, min: 0, max: 28 }, // %
};


// const Discount = {
//   discountType: { type: String, enum: ["PERCENT", "FLAT"], required: true },
//   value: { type: Number, required: true, min: 0 },
//   startTime: { type: Date, required: true },
//   endTime: { type: Date, required: true },
//   active: { type: Boolean, default: true },
// };

/** ---------- Variant (SKU) ---------- **/
const VariantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true },
    options: {
      type: Object,
      default: {},
    },

    images: { type: [String], default: [] },
    pricing: Money,
    inventory: {
      totalStock: { type: Number, default: 0, min: 0 },
      // reservedStock: { type: Number, default: 0, min: 0 }, 
      lowStockThreshold: { type: Number, default: 5 },
    },
    // stock: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["IN_STOCK", "OUT_OF_STOCK", "PREORDER", "DISCONTINUED"],
      default: "IN_STOCK",
    },
    // barcode: {
    //   upc: { type: String, trim: true },
    //   ean: { type: String, trim: true },
    //   gtin: { type: String, trim: true },
    // },
    weight: Weight,
    dimensions: Dimensions,
    isDefault: { type: Boolean, default: false },
  },
  { _id: false, timestamps: false }
);

/** ---------- Product ---------- **/
const ProductSchema = new mongoose.Schema(
  {
    referenceWebsite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Websitelist",
    },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    // Category path for filters/breadcrumbs
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
    },
    // Core identity
    productName: { type: String, required: true, trim: true },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    // Content
    description: { type: String, required: true, trim: true },
    keyFeatures: [{ type: String, trim: true }], // bullets
    specs: [
      {
        group: { type: String, trim: true }, // e.g., "General", "Display"
        key: { type: String, trim: true, required: true },
        value: { type: String, trim: true, required: true },
        unit: { type: String, trim: true },
      },
    ],

    // Product-level media (generic gallery)
    images: { type: [String], default: [] },

    // Variants (SKUs)
    variants: {
      type: [VariantSchema],
      validate: [
        {
          validator: function (arr) {
            // Ensure at least one variant
            return Array.isArray(arr) && arr.length > 0;
          },
          message: "At least one variant is required.",
        },
        {
          // Ensure exactly one default variant
          validator: function (arr) {
            const defaults = arr.filter((v) => v.isDefault);
            return defaults.length === 1;
          },
          message: "Exactly one variant must be marked as default.",
        },
        {
          // Ensure price <= mrp for each variant
          validator: function (arr) {
            return arr.every((v) => v.pricing?.price <= v.pricing?.mrp);
          },
          message: "Variant price cannot be greater than MRP.",
        },
      ],
    },

    // Deal of the Day (applies at product level; you can also target specific variant IDs if needed)
    dealOfTheDay: {
      status: { type: Boolean, default: false },
      startTime: { type: Date },
      endTime: { type: Date },
      discountPercent: { type: Number, min: 0, max: 95 }, // optional override
      variantIds: [{ type: String }], // optional: limit deal to specific variant.sku
    },

    // Commerce constraints
    codAvailable: { type: Boolean, default: true },
    minOrderQty: { type: Number, default: 1, min: 1 },
    maxOrderQty: { type: Number, default: 10, min: 1 },

    returnPolicy: ReturnPolicy,
    warranty: Warranty,
    tax: Tax,
    // discount: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Discount",
    //   default: null
    // },
    discount: {
      type: Number, default: 0
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },

    // Search & merchandising
    tags: [{ type: String, trim: true, lowercase: true }],
    attributesFlat: { type: Map, of: String },

    views: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },

    rating: {
      avg: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },

    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      metaKeywords: [{ type: String, trim: true, lowercase: true }],
      canonicalUrl: { type: String, trim: true },
    },

    // Admin
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"],
      default: "ACTIVE",
    },
    visibility: {
      type: String,
      enum: ["PUBLIC", "PRIVATE"],
      default: "PUBLIC",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

/** ---------- Indexes ---------- **/

// Text search on name, description & features
ProductSchema.index({
  productName: "text",
  description: "text",
  keyFeatures: "text",
});

// Fast filter/sort
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ "variants.pricing.price": 1 }); // price range sort
ProductSchema.index({ "variants.sku": 1 }, { unique: true, sparse: true }); // global SKU uniqueness
ProductSchema.index({ tags: 1 });

// Validate deal times
ProductSchema.pre("validate", function (next) {
  const d = this.dealOfTheDay;
  if (d?.status && d?.startTime && d?.endTime) {
    if (d.startTime >= d.endTime) {
      return next(
        new Error("dealOfTheDay.startTime must be earlier than endTime")
      );
    }
  }
  next();
});

// Helper virtuals
ProductSchema.virtual("priceRange").get(function () {
  if (!this.variants?.length) return null;
  const prices = this.variants.map((v) => v.pricing?.price ?? 0);
  return { min: Math.min(...prices), max: Math.max(...prices) };
});


ProductSchema.methods.isDealLive = function () {
  const d = this.dealOfTheDay;
  if (!d?.status || !d.startTime || !d.endTime) return false;
  const now = new Date();
  return now >= d.startTime && now <= d.endTime;
};


ProductSchema.virtual("effectivePrice").get(function () {
  let basePrice = this.priceRange?.min || 0;

  // Deal of the Day
  if (this.isDealLive() && this.dealOfTheDay?.discountPercent) {
    basePrice = basePrice * (1 - this.dealOfTheDay.discountPercent / 100);
  }

  // First active discount
  const activeDiscount = this.discounts?.find(
    d => d.active && new Date() >= d.startTime && new Date() <= d.endTime
  );
  if (activeDiscount) {
    if (activeDiscount.discountType === "PERCENT") {
      basePrice = basePrice * (1 - activeDiscount.value / 100);
    } else {
      basePrice = basePrice - activeDiscount.value;
    }
  }

  return Math.max(basePrice, 0);
});

// Stock status (aggregated from variants)
ProductSchema.virtual("stockStatus").get(function () {
  if (!this.variants?.length) return "OUT_OF_STOCK";

  const totalStock = this.variants.reduce((sum, v) => sum + (v.inventory?.totalStock || 0), 0);
  const lowStockThreshold = Math.min(...this.variants.map(v => v.inventory?.lowStockThreshold ?? 5));

  if (totalStock <= 0) return "OUT_OF_STOCK";
  if (totalStock <= lowStockThreshold) return "LOW_STOCK";
  return "IN_STOCK";
});


const Product = mongoose.model("Product", ProductSchema);
export default Product;


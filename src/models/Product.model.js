// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema(
//   {
//     referenceWebsite: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Websitelist",
//       // required: true,
//     },
//     productName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     images: {
//       type: [String],
//       required: true,
//     },
//     price: {
//       type: Number,
//       required: true,
//       min: [0, "Price must be a positive value"],
//     },
//     dealOfTheDay: {
//       status: { type: Boolean, default: false },
//       startTime: { type: Date },         // When the deal starts
//       endTime: { type: Date },           // When the deal ends
//     },
//     actualPrice: {
//       type: Number,
//       min: [0, "Price must be a positive value"],
//       default: 0,
//     },
//     size: {
//       type: String, // Single size, not an array
//       //  enum: ["S", "M", "L", "XL", "XXL", "Free", "Custom", "OneSize"],
//       default: "Free", // Default size
//       required: true,
//     },
//     discount: {
//       type: Number,
//       default: 0
//     },
//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "ProductCategory"
//     },

//     addedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     }
//   },
//   {
//     timestamps: true, // Adds createdAt and updatedAt timestamps
//   }
// );

// const Product = mongoose.model("Product", productSchema);

// export default Product;

import mongoose from "mongoose";

/** ---------- Small helper sub-schemas ---------- **/

const Money = {
  mrp: { type: Number, required: true, min: 0 }, // MRP / list price
  price: { type: Number, required: true, min: 0 }, // Selling price
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

/** ---------- Variant (SKU) ---------- **/
const VariantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true },
    options: {
      type: Map,
      of: String,
      default: undefined,
    },
    images: { type: [String], default: [] },
    pricing: Money,
    stock: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["IN_STOCK", "OUT_OF_STOCK", "PREORDER", "DISCONTINUED"],
      default: "IN_STOCK",
    },
    barcode: {
      upc: { type: String, trim: true },
      ean: { type: String, trim: true },
      gtin: { type: String, trim: true },
    },
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

const Product = mongoose.model("Product", ProductSchema);
export default Product;

// {
//   "productName": "Premium Cotton T-Shirt",
//   "slug": "premium-cotton-tshirt",
//   "category": "66bfa1e9d8...ab",
//   "description": "100% cotton tee, breathable fabric.",
//   "keyFeatures": ["100% Cotton", "Regular Fit", "Machine Wash"],
//   "specs": [
//     { "group": "General", "key": "Material", "value": "Cotton" },
//     { "group": "General", "key": "Fit", "value": "Regular" }
//   ],
//   "images": ["https://cdn/tee/main1.jpg","https://cdn/tee/main2.jpg"],
//   "variants": [
//     {
//       "sku": "TEE-RED-M",
//       "options": { "color": "Red", "size": "M" },
//       "images": ["https://cdn/tee/red1.jpg"],
//       "pricing": { "mrp": 799, "price": 499, "currency": "INR" },
//       "stock": 25,
//       "isDefault": true
//     },
//     {
//       "sku": "TEE-RED-L",
//       "options": { "color": "Red", "size": "L" },
//       "pricing": { "mrp": 799, "price": 499, "currency": "INR" },
//       "stock": 10
//     },
//     {
//       "sku": "TEE-BLK-M",
//       "options": { "color": "Black", "size": "M" },
//       "pricing": { "mrp": 799, "price": 549, "currency": "INR" },
//       "stock": 0,
//       "status": "OUT_OF_STOCK"
//     }
//   ],
//   "dealOfTheDay": {
//     "status": true,
//     "startTime": "2025-08-12T03:30:00.000Z",
//     "endTime": "2025-08-13T03:29:59.000Z",
//     "discountPercent": 10,
//     "variantIds": ["TEE-RED-M","TEE-RED-L"]
//   },
//   "tax": { "hsn": "6109", "gstRate": 5 },
//   "returnPolicy": { "eligible": true, "days": 7 },
//   "warranty": { "type": "Seller", "durationMonths": 0 },
//   "tags": ["tshirt","cotton","mens"],
//   "addedBy": "66bf...user"
// }

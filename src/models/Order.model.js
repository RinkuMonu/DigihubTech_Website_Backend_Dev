import mongoose from "mongoose";

const orderProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // Reference to the Product model
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1, // Quantity cannot be less than 1
    },
    price: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    address: { type: String },
    country: { type: String },
    pinCode: { type: String },
    state: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model (customer)
      required: true,
    },
    referenceWebsite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Websitelist",
    },
    products: [orderProductSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      type: shippingAddressSchema,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to calculate the total amount for the order before saving
orderSchema.pre("save", function (next) {
  this.totalAmount = this.products.reduce((total, product) => {
    return total + product.total;
  }, 0);
  next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;

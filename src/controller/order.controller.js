import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js"; // Importing Product model to get product details
import Cart from "../models/Cart.model.js";
import User from "../models/User.model.js";
import mongoose from "mongoose";


export const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, type = null, couponCode } = req.body;
    const customer = req.user?.id;
    const referenceWebsite = req.user?.referenceWebsite;

    // validation
    if (!products || products.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one product is required" });
    }

    let totalAmount = 0;
    let updatedProducts = [...products]; // copy

    for (let productItem of products) {
      const product = await Product.findById(productItem.product);

      if (!product) {
        return res
          .status(400)
          .json({ message: `Product not found for ID: ${productItem.product}` });
      }

      // seller ka wallet update karna
      await User.findByIdAndUpdate(
        product.addedBy,
        [
          {
            $set: {
              wallet: {
                $add: [
                  "$wallet",
                  {
                    $subtract: [
                      product.actualPrice,
                      {
                        $divide: [
                          { $multiply: [product.actualPrice, "$commissionRate"] },
                          100,
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
        { new: true }
      );

      // product owner add karna
      const index = updatedProducts.findIndex(
        (x) => x.product === product._id.toString()
      );
      if (index !== -1) {
        updatedProducts[index].owner = product.addedBy;
      }

      // total amount calculate karna
      totalAmount += product.actualPrice * productItem.quantity;
    }

    // order create karna
    const newOrder = new Order({
      referenceWebsite,
      customer,
      products: updatedProducts,
      totalAmount,
      shippingAddress,
      couponCode: couponCode || null,
      status: "pending", // default status
      createdAt: Date.now(),
    });

    await newOrder.save();

    const identifier = `${customer}-${referenceWebsite}`;

    // agar cart se order ban raha hai to cart clear karo
    if (type === "cart") {
      const cart = await Cart.findOne({ identifier });
      if (cart) {
        cart.items = [];
        cart.totalAmount = 0;
        cart.isCheckedOut = true;
        cart.lastUpdated = Date.now();
        await cart.save();
      }
    }

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Order create error:", error);
    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};


export const getOrdersByReferenceWebsite = async (req, res) => {
  try {
    const {
      referenceWebsite,
      customerName,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = "createdAt", // Default to sorting by creation date
      sortOrder = "desc", // Default to descending order
    } = req.query;
    const filter = {};
    if (referenceWebsite) {
      filter.referenceWebsite = referenceWebsite;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // If minPrice or maxPrice is provided, add price filters
    if (minPrice || maxPrice) {
      filter.totalAmount = filter.totalAmount || {};
      if (minPrice) filter.totalAmount.$gte = parseFloat(minPrice);
      if (maxPrice) filter.totalAmount.$lte = parseFloat(maxPrice);
    }

    const skip = (page - 1) * limit;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    let orders = await Order.find(filter)
      .populate("products.product", "productName price")
      .populate("customer", "firstName lastName email")
      .populate("referenceWebsite", "websiteName")
      .sort(sortOptions) // Apply sorting
      .skip(skip)
      .limit(parseInt(limit));

    if (customerName) {
      orders = orders.filter((order) => {
        const fullName =
          `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase();
        return fullName.includes(customerName.toLowerCase());
      });
    }

    const totalOrders = await Order.countDocuments(filter);

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found matching the criteria." });
    }

    res.status(200).json({
      orders,
      totalOrders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalOrders / limit),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch orders.", error: error.message });
  }
};

export const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const orders = await Order.find({ customer: userId })
      .populate("products.product", "productName price images")
      .populate("customer", "firstName lastName email mobile");
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }
    res.status(200).json({ message: "Orders retrieved successfully", orders });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: error.message });
  }
};

// Get a specific order by ID
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id })
      .populate("customer", "firstName lastName email mobile")
      .populate("products.product", "productName price image");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order retrieved successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve order", error: error.message });
  }
};

// Update order status (for example, when an order is shipped or delivered)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const { id } = req.params;

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    // Validate status values
    if (
      status &&
      !["pending", "processing", "shipped", "delivered", "cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }
    if (
      paymentStatus &&
      !["pending", "completed", "failed"].includes(paymentStatus)
    ) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    // Find and update order
    const order = await Order.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res
      .status(200)
      .json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error("Error updating order:", error);
    return res
      .status(500)
      .json({ message: "Failed to update order", error: error.message });
  }
};

// Delete an order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete order", error: error.message });
  }
};


// overview part
export const getSalesOverview = async (req, res) => {
  try {

    const now = new Date();

    // Start of Day
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Start of Week (Monday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    // Start of Month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start of Year
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Sales Stats
    const dailySales = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay }, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]);

    const weeklySales = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfWeek }, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]);

    const monthlySales = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]);

    const yearlySales = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfYear }, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      daily: dailySales[0] || { total: 0, count: 0 },
      weekly: weeklySales[0] || { total: 0, count: 0 },
      monthly: monthlySales[0] || { total: 0, count: 0 },
      yearly: yearlySales[0] || { total: 0, count: 0 },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching sales overview" });
  }
};


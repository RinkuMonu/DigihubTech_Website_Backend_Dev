import ReviewModel from "../models/Review.model.js";
import Order from "../models/Order.model.js";

export const createReview = async (req, res) => {
  const { rating, comment } = req.body;
  const { referenceWebsite } = req.query;
  const productId = req.params.productId;

  try {
    // ✅ Check if user has purchased the product
    const hasPurchased = await Order.findOne({
      customer: req.user.id,
      "products.product": productId,
      paymentStatus: "completed",
    });

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: "You can only review a product you have purchased",
      });
    }

    // ✅ Check if already reviewed
    const alreadyReviewed = await ReviewModel.findOne({
      product: productId,
      user: req.user.id,
    });

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You already reviewed this product" });
    }

    // ✅ Create review
    const review = await ReviewModel.create({
      product: productId,
      user: req.user.id,
      rating,
      comment,
      referenceWebsite,
    });

    res.status(201).json({ success: true, review, message: "Review done" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to post review", error: err.message });
  }
};

export const getReview = async (req, res) => {
  try {
    const reviews = await ReviewModel.find({
      product: req.params.productId,
    }).populate("user", "firstName lastName email");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

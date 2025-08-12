import express from "express";
import { createReview, getReview } from "../controller/review.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/:productId", verifyToken, createReview);
router.get("/:productId", getReview);

export default router;

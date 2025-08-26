import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  createMainCategory,
  getMainCategory,
  updateMainCategory,
} from "../controller/Category.controller.js";
import { isAdmin } from "../middleware/isAdmin.js";
import upload from "../middleware/multerConfig.js";

const router = express.Router();

router.post("/", upload.array("images", 5), isAdmin, createCategory);

router.post("/createMainCategory", createMainCategory);
router.get("/getMainCategory", getMainCategory);
router.post("/updateMainCategory", updateMainCategory);

router.get("/", getCategories);
router.get("/:id", isAdmin, getCategoryById);
router.put("/:id", upload.single("images", 5), isAdmin, updateCategory);
// Route to delete a category by ID
router.delete("/:id", isAdmin, deleteCategory);

export default router;

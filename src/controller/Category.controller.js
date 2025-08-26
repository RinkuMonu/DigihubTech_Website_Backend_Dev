import ProductCategory from "../models/Catergroy.model.js";
import Websitelist from "../models/Website.model.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description, referenceWebsite, subcategory } = req.body;
    let imageArray = [];

    if (req.file) {
      imageArray = [req.file.path];
    } else if (req.files) {
      imageArray = req.files.map((file) => file.path);
    }

    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }

    let category = await ProductCategory.findOne({ name });

    if (category && !referenceWebsite) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists." });
    }

    if (!category) {
      category = new ProductCategory({
        name,
        description,
        image: imageArray[0],
        subcategory: subcategory?.toLowerCase(),
      });
      await category.save();
    }

    if (referenceWebsite) {
      await Websitelist.findByIdAndUpdate(referenceWebsite, {
        $addToSet: { categories: category._id },
      });
    }
    res.status(200).json({
      message: "Category created successfully.",
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      message: "Failed to create category.",
      error: error.message,
    });
  }
};

export const createMainCategory = async (req, res) => {
  const { subcategory } = req.body;
  

  // if (!subcategory) {
  //   return res.status(400).json({ message: "Category name is required." });
  // }

  try {
    // Check if category already exists
    const existingCategory = await ProductCategory.findOne({
      subcategory: subcategory,
    });
    if (existingCategory) {
      return res.status(409).json({ message: "Category already exists." });
    }

    // Create new category document
    const newCategory = new ProductCategory({ subcategory: subcategory });
    await newCategory.save();

    return res.status(201).json({
      message: "Category created successfully.",
      category: newCategory,
    });
  } catch (error) {
    // Mongoose validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Error creating category:", error);
    return res
      .status(500)
      .json({ message: "Server error while creating category." });
  }
};

export const getMainCategory = async (_, res) => {
  try {
    const categories = await ProductCategory.aggregate([
      {
        $group: {
          _id: "$subcategory",
          id: { $first: "$_id" },
        },
      },
      {
        $project: {
          _id: 0,
          subcategory: "$_id",
          id: 1,
        },
      },
    ]);

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching subcategories with ids:", error);
    res
      .status(500)
      .json({ message: "Server error fetching subcategories with ids" });
  }
};

export const updateMainCategory = async (req, res) => {
  const { id, subcategory } = req.body;
  console.log(id);

  if (!id) {
    return res.status(400).json({ message: "Category ID is required." });
  }

  if (!subcategory) {
    return res.status(400).json({ message: "Category name is required." });
  }

  try {
    // Check if another category already has this subcategory
    const existingCategory = await ProductCategory.findOne({
      subcategory,
      _id: { $ne: id }, // exclude the current category from duplicate check
    });

    if (existingCategory) {
      return res.status(409).json({ message: "Category already exists." });
    }

    const updatedCategory = await ProductCategory.findByIdAndUpdate(
      id,
      { subcategory },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found." });
    }

    return res.status(200).json({
      message: "Category updated successfully.",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating category." });
  }
};

// Get all product categories
export const getCategories = async (req, res) => {
  try {
    const categories = await ProductCategory.find();
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch categories.", error: error.message });
  }
};

// Get a single product category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await ProductCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json(category);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch category.", error: error.message });
  }
};

// Update a product category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, subcategory } = req.body;
    const category = await ProductCategory.findByIdAndUpdate(
      id,
      { name, description, subcategory },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    res
      .status(200)
      .json({ message: "Category updated successfully.", category });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update category.", error: error.message });
  }
};

// Delete a product category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await ProductCategory.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json({ message: "Category deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete category.", error: error.message });
  }
};

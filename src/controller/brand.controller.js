import mongoose from "mongoose";
import Brand from "../models/brand.modal.js";
import ProductCategory from "../models/Catergroy.model.js";
import Product from "../models/Product.model.js";

export const createBrand = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in to create a brand",
      });
    }

    // Basic required field validation
    const { name, description, referenceWebsite, slug, status } = req.body;
    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Brand name is required" });
    }
    let logo = null;
    if (req.file) {
      logo = `${req.file.path}`;
    }
    function makeSlug(text) {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-");
    }
    const cleanSlug = slug ? makeSlug(slug) : makeSlug(name);

    const existingBrand = await Brand.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingBrand) {
      return res
        .status(400)
        .json({ success: false, message: "Brand already exists" });
    }
    const brand = new Brand({
      referenceWebsite,
      name: name.trim(),
      slug: cleanSlug,
      description,
      logo,
      status,
      addedBy: req.user._id,
    });

    await brand.save();

    res.status(201).json({ success: true, data: brand });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all brands
export const getBrands = async (req, res) => {
  try {
    const { referenceWebsite, search } = req.query;

    // Base brand query
    const brandQuery = {};
    if (referenceWebsite) {
      brandQuery.referenceWebsite = new mongoose.Types.ObjectId(referenceWebsite);
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim().split(/\s+/).join(".*"), "i");

      const usedCategory = await ProductCategory.findOne({ name: regex });
      let categoryIds = [];
      if (usedCategory) {
        const usedBrandIds = await Product.distinct("brand", {
          category: usedCategory._id,
          ...(referenceWebsite && { referenceWebsite }), // apply website filter
        });

        brandQuery._id = { $in: usedBrandIds };
      } else {
        return res.json({ success: true, count: 0, data: [] });
      }
    }

    // Fetch brands
    const brands = await Brand.find(brandQuery).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: brands.length,
      data: brands,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Get brand by ID
export const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand)
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    res.json({ success: true, data: brand });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update brand
export const updateBrand = async (req, res) => {
  try {
    const existingBrand = await Brand.findById(req.params.id);
    if (!existingBrand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    let logo = existingBrand.logo;
    if (req.file) {
      logo = `${req.file.path}`;
    }

    let slug = req.body.slug;
    if (slug) {
      slug = slug
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9\-]/g, "")
        .toLowerCase();
    }

    const updateData = {
      ...req.body,
      logo,
      ...(slug && { slug }),
    };


    const updatedBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({ success: true, data: updatedBrand });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete brand
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand)
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    res.json({ success: true, message: "Brand deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

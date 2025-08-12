import Brand from "../models/brand.modal.js";
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
      logo = `/uploads/${req.file.filename}`;
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
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.json({ success: true, data: brands });
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
    // Pehle existing brand ko fetch karo
    const existingBrand = await Brand.findById(req.params.id);
    if (!existingBrand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    // Agar nayi file upload hui hai toh logo update karo, nahi toh existing logo rakho
    let logo = existingBrand.logo;
    if (req.file) {
      logo = `${req.file.path}`;
    }

    // Baaki fields req.body me hain, unko merge karte hain
    const updateData = {
      ...req.body,
      logo, // yahan logo ko override kar diya
    };

    // Brand ko update karo
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

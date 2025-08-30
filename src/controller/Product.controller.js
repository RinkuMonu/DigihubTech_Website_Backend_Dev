import Product from "../models/Product.model.js";
import Category from "../models/Catergroy.model.js";
import mongoose from "mongoose";
import Websitelist from "../models/Website.model.js"; // Import the Websitelist model
import Brand from "../models/brand.modal.js";
import couponModel from "../models/coupon.model.js";
// export const createProduct = async (req, res) => {
//   try {
//     console.log("Incoming request body:", req.body);
//     console.log("Uploaded files:", req.files);
//     console.log("User info:", req.user);

//     const {
//       referenceWebsite,
//       productName,
//       discount,
//       price,
//       actualPrice,
//       category,
//       description,
//       size
//     } = req.body;

//     let imageArray = [];

//     if (req.file) {
//       imageArray = [req.file.path];
//     } else if (req.files) {
//       imageArray = req.files.map(file => file.path);
//     }
//     if (req.body.variants) {
//   req.body.variants = JSON.parse(req.body.variants);
// }

//     const productSize = size || "M";

//     console.log("Processed images:", imageArray);
//     console.log("Product size:", productSize);
//     console.log("Price:", price, "Actual Price:", actualPrice);

//     if (actualPrice < 0 || actualPrice > price) {
//       console.warn("Invalid actualPrice detected");
//       return res.status(400).json({
//         message: "Invalid actualPrice. It must be a positive value and less than or equal to price.",
//       });
//     }

//     const product = new Product({
//       referenceWebsite,
//       productName,
//       images: imageArray,
//       price: Number(price),
//       actualPrice: Number(actualPrice),
//       category,
//       description,
//       size: productSize,
//       discount: Number(discount),
//       addedBy: req.user?.id?.toString(),
//     });

//     console.log("Saving product to database:", product);

//     await product.save();

//     console.log("Product saved successfully");

//     res.status(200).json({ message: "Product added successfully", product });
//   } catch (error) {
//     console.error("Error in createProduct:", error);
//     res.status(500).json({ message: "Failed to add product", error: error.message });
//   }
// };

export const createProduct = async (req, res) => {
  req.body = JSON.parse(req.body.productData)
  const requiredFields = ["referenceWebsite", "productName", "category", "brand"];
  // Required fields check
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({
        success: false,
        message: `${field} is required`,
      });
    }
  }

  try {
    // Parse JSON fields if coming as string
    const parseJSON = (field) => {
      if (req.body[field] && typeof req.body[field] === "string") {
        try {
          return JSON.parse(req.body[field]);
        } catch (err) {
          throw new Error(`Invalid ${field} JSON format`);
        }
      }
      return req.body[field];
    };

    req.body.variants = parseJSON("variants") || [];
    req.body.specs = parseJSON("specs") || [];
    req.body.returnPolicy = parseJSON("returnPolicy") || undefined;
    req.body.warranty = parseJSON("warranty") || undefined;
    req.body.tax = parseJSON("tax") || undefined;
    req.body.dealOfTheDay = parseJSON("dealOfTheDay") || undefined;


    if (req.body.keyFeatures && typeof req.body.keyFeatures === "string") {
      req.body.keyFeatures = JSON.parse(req.body.keyFeatures);
    }
    if (req.body.tags && typeof req.body.tags === "string") {
      req.body.tags = JSON.parse(req.body.tags);
    }

    // Product-level images
    const productImages = (req.files?.images || []).map((file) => file.path);

    // Assign images to variants
    if (Array.isArray(req.body.variants) && req.body.variants.length > 0) {
      req.body.variants.forEach((variant, index) => {
        const variantKey = `variantImages_${index}`;
        if (req.files?.[variantKey]) {
          variant.images = req.files[variantKey].map((file) => file.path);
        }
      });
    }

    // Generate slug (ensure uniqueness)
    let slug = req.body.productName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existingSlug = await Product.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Auto-fill attributesFlat from default variant
    let attributesFlat = {};
    if (Array.isArray(req.body.variants) && req.body.variants.length > 0) {
      const defaultVariant =
        req.body.variants.find((v) => v.isDefault) || req.body.variants[0];
      if (defaultVariant?.options) {
        attributesFlat = { ...defaultVariant.options };
      }
    }

    // Build product data
    const productData = {
      referenceWebsite: req.body.referenceWebsite,
      brand: req.body.brand,
      category: req.body.category,
      productName: req.body.productName,
      slug,
      description: req.body.description,
      keyFeatures: req.body.keyFeatures,
      specs: req.body.specs,
      images: productImages,
      variants: req.body.variants,
      dealOfTheDay: req.body.dealOfTheDay,
      discount: req.body.discount || null,
      // discount: req.body.price,
      codAvailable: req.body.codAvailable ?? true,
      minOrderQty: req.body.minOrderQty || 1,
      maxOrderQty: req.body.maxOrderQty || 10,
      returnPolicy: req.body.returnPolicy,
      warranty: req.body.warranty,
      tax: req.body.tax,
      tags: req.body.tags,
      attributesFlat,
      seo: req.body.seo || {},
      status: req.body.status || "ACTIVE",
      visibility: req.body.visibility || "PUBLIC",
      addedBy: req.user?.id,
    };

    // Save product
    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add product",
    });
  }
};

export const createMultipleProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        message: "Invalid input. Please provide an array of products.",
      });
    }
    const formattedProducts = products.map((product) => ({
      referenceWebsite: "6788b0054c4a217090bf6636",
      productName: product.productName,
      images: typeof product.images === "string" ? [product.images] : [],
      price: product.price,
      actualPrice: product.actualPrice,
      category: product.category,
      description: product.description,
      size: product.size || "M", // Default size is "M" if not provided
      discount: product.discount || null,
      addedBy: "679c5cc89e0012636ffef9ed",
    }));
    const result = await Product.insertMany(formattedProducts);
    res.status(200).json({
      message: `${result.length} products added successfully`,
      products: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add products", error: error.message });
  }
};
//n
// export const getProducts = async (req, res) => {
//   try {
//     const {
//       referenceWebsite,
//       search,
//       category,
//       brand,
//       minPrice,
//       maxPrice,
//       rating,
//       discount,
//       sortBy = "createdAt",
//       sortOrder = "desc",
//       page = 1,
//       limit = 10,
//     } = req.query;

//     if (!referenceWebsite) {
//       return res.status(400).json({ message: "referenceWebsite is required" });
//     }

//     const website = await Websitelist.findById(referenceWebsite);
//     if (!website) {
//       return res.status(404).json({ message: "Reference website not found" });
//     }

//     // ✅ Match conditions
//     const matchStage = {
//       referenceWebsite: new mongoose.Types.ObjectId(referenceWebsite),
//     };

//     // website.categories restrict karega products ko
//     if (!category && website.categories?.length > 0) {
//       matchStage.category = { $in: website.categories };
//     }

//     if (category) {
//       const categoryDoc = await Category.findOne({ name: category.toLowerCase() });

//       if (!categoryDoc) {
//         return res.status(200).json({ products: [] });
//       }
//       matchStage.category = categoryDoc._id;
//     }


//     if (brand) {
//       const brandArray = brand.split(",").map((b) => b.trim());

//       const brandDocs = await Brand.find({ slug: { $in: brandArray } }, "_id");

//       const brandIds = brandDocs.map((doc) => doc._id);

//       matchStage.brand = { $in: brandIds };
//     }


//     // if (discount) {
//     //   matchStage.discount = new mongoose.Types.ObjectId(discount);
//     // }

//     let advanceFilter = [];

//     Object.keys(req.query).forEach((key) => {
//       if (
//         !["page", "limit", "sort", "category", "brand", "minPrice", "maxPrice", "rating", "referenceWebsite"].includes(key)
//       ) {
//         // Variants check
//         advanceFilter.push({
//           [`variants.options.${key}`]: { $regex: req.query[key], $options: "i" }
//         });

//         // Specs check
//         advanceFilter.push({
//           specs: {
//             $elemMatch: {
//               key: { $regex: key, $options: "i" },
//               value: { $regex: req.query[key], $options: "i" }
//             }
//           }
//         });
//       }
//     });

//     if (advanceFilter.length > 0) {
//       matchStage.$or = advanceFilter;
//     }
//     console.log(matchStage);

//     if (minPrice || maxPrice) {
//       matchStage["variants.pricing.price"] = {};
//       if (minPrice) matchStage["variants.pricing.price"].$gte = parseFloat(minPrice);
//       if (maxPrice) matchStage["variants.pricing.price"].$lte = parseFloat(maxPrice);
//     }
//     if (rating) {
//       matchStage["rating.avg"] = { $gte: parseFloat(rating) };
//     }

//     const pageNumber = parseInt(page, 10);
//     const pageSize = parseInt(limit, 10);

//     // ✅ Aggregation Pipeline
//     const pipeline = [
//       { $match: matchStage },

//       // Category lookup
//       {
//         $lookup: {
//           from: "users",
//           localField: "addedBy",
//           foreignField: "_id",
//           as: "ower",
//         },
//       },
//       { $unwind: { path: "$ower", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "productcategories",
//           localField: "category",
//           foreignField: "_id",
//           as: "category",
//         },
//       },
//       { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

//       // Brand lookup
//       {
//         $lookup: {
//           from: "brands",
//           localField: "brand",
//           foreignField: "_id",
//           as: "brand",
//         },
//       },
//       { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },

//       // // Discount lookup
//       {
//         $lookup: {
//           from: "discounts",
//           localField: "discount",
//           foreignField: "_id",
//           as: "discount",
//         },
//       },
//       { $unwind: { path: "$discount", preserveNullAndEmptyArrays: true } },

//       {
//         $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 },
//       },

//       {
//         $facet: {
//           metadata: [
//             { $count: "totalDocuments" },
//             {
//               $addFields: {
//                 currentPage: pageNumber,
//                 pageSize,
//                 totalPages: { $ceil: { $divide: ["$totalDocuments", pageSize] } },
//               },
//             },
//           ],
//           products: [
//             { $skip: (pageNumber - 1) * pageSize },
//             { $limit: pageSize },
//           ],
//         },
//       },
//     ];

//     const results = await Product.aggregate(pipeline);

//     const metadata = results[0]?.metadata[0] || {
//       totalDocuments: 0,
//       currentPage: pageNumber,
//       pageSize,
//       totalPages: 0,
//     };

//     res.status(200).json({
//       products: results[0] || [],
//       pagination: metadata,
//     });
//   } catch (error) {
//     console.error("Error in getProducts:", error);
//     res.status(500).json({ message: "Failed to fetch products", error: error.message });
//   }
// };

export const getProducts = async (req, res) => {
  try {
    const {
      referenceWebsite,
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      discount,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
      ...otherFilters
    } = req.query;

    if (!referenceWebsite) {
      return res.status(400).json({ message: "referenceWebsite is required" });
    }

    const website = await Websitelist.findById(referenceWebsite);
    if (!website) {
      return res.status(404).json({ message: "Reference website not found" });
    }

    const matchStage = {
      referenceWebsite: new mongoose.Types.ObjectId(referenceWebsite),
    };

    // Category filter
    if (!category && website.categories?.length > 0) {
      matchStage.category = { $in: website.categories };
    }
    if (category) {
      const categoryDoc = await Category.findOne({ name: category.toLowerCase() });
      if (!categoryDoc) return res.status(200).json({ products: [], pagination: {} });
      matchStage.category = categoryDoc._id;
    }

    // Brand filter
    if (brand) {
      const brandArray = brand.split(",").map((b) => b.trim());
      const brandDocs = await Brand.find({ slug: { $in: brandArray } }, "_id");
      const brandIds = brandDocs.map((doc) => doc._id);
      matchStage.brand = { $in: brandIds };
    }

    // Rating filter
    if (rating) matchStage["rating.avg"] = { $gte: parseFloat(rating) };

    // Price filter (minPrice/maxPrice from query)
    if (minPrice || maxPrice) {
      matchStage["variants"] = {
        $elemMatch: {
          "pricing.price": {
            ...(minPrice && { $gte: parseFloat(minPrice) }),
            ...(maxPrice && { $lte: parseFloat(maxPrice) }),
          },
        },
      };
    }

    // Advanced search parsing: "under 30k", "above 50k", etc.
    if (search) {
      const lowerSearch = search.toLowerCase();
      let regexSearch = lowerSearch;

      // Price pattern parsing
      const underMatch = lowerSearch.match(/under (\d+)(k|l|m)?/);
      const aboveMatch = lowerSearch.match(/above (\d+)(k|l|m)?/);

      const priceFilter = {};
      if (underMatch) {
        let value = parseInt(underMatch[1]);
        if (underMatch[2] === "k") value *= 1000;
        else if (underMatch[2] === "l") value *= 100000;
        else if (underMatch[2] === "m") value *= 1000000;
        priceFilter.$lte = value;
        regexSearch = regexSearch.replace(/under \d+[klm]?/, "").trim();
      }
      if (aboveMatch) {
        let value = parseInt(aboveMatch[1]);
        if (aboveMatch[2] === "k") value *= 1000;
        else if (aboveMatch[2] === "l") value *= 100000;
        else if (aboveMatch[2] === "m") value *= 1000000;
        priceFilter.$gte = value;
        regexSearch = regexSearch.replace(/above \d+[klm]?/, "").trim();
      }

      // Merge priceFilter with matchStage
      if (Object.keys(priceFilter).length > 0) {
        matchStage["variants"] = { $elemMatch: { "pricing.price": priceFilter } };
      }

      // Text search
      if (regexSearch.length > 0) {
        const regex = regexSearch.replace(/\s+/g, ".*");
        matchStage.$or = [
          { productName: { $regex: regex, $options: "i" } },
          { description: { $regex: regex, $options: "i" } },
          { keyFeatures: { $regex: regex, $options: "i" } },
        ];
      }
    }

    // Dynamic variant/spec filters
    const variantFilters = Object.keys(otherFilters)
      .filter((k) => k !== "referenceWebsite" && otherFilters[k])
      .map((k) => ({
        [`variants.options.${k}`]: { $regex: otherFilters[k], $options: "i" },
      }));

    if (variantFilters.length > 0) {
      matchStage.$and = variantFilters;
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const pipeline = [
      { $match: matchStage },

      // Populate addedBy
      { $lookup: { from: "users", localField: "addedBy", foreignField: "_id", as: "addedBy" } },
      { $unwind: { path: "$addedBy", preserveNullAndEmptyArrays: true } },

      // Category lookup
      { $lookup: { from: "productcategories", localField: "category", foreignField: "_id", as: "category" } },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

      // Brand lookup
      { $lookup: { from: "brands", localField: "brand", foreignField: "_id", as: "brand" } },
      { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },

      // Discount lookup
      { $lookup: { from: "coupons", localField: "coupon", foreignField: "_id", as: "coupon" } },
      { $unwind: { path: "$coupon", preserveNullAndEmptyArrays: true } },

      // Sort
      { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },

      // Pagination
      {
        $facet: {
          metadata: [
            { $count: "totalDocuments" },
            { $addFields: { currentPage: pageNumber, pageSize, totalPages: { $ceil: { $divide: ["$totalDocuments", pageSize] } } } },
          ],
          products: [
            { $skip: (pageNumber - 1) * pageSize },
            { $limit: pageSize },
          ],
        },
      },
    ];

    const results = await Product.aggregate(pipeline);
    const metadata = results[0]?.metadata[0] || { totalDocuments: 0, currentPage: pageNumber, pageSize, totalPages: 0 };

    res.status(200).json({
      products: results[0]?.products || [],
      pagination: metadata,
    });
  } catch (error) {
    console.error("Error in getProducts:", error);
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};



// export const getProducts = async (req, res) => {
//     try {
//         const {
//             referenceWebsite,
//             search,
//             category, // Specific category filter
//             minPrice,
//             maxPrice,
//             sortBy = 'createdAt', // Sorting field
//             sortOrder = 'desc',   // Sorting order
//             page = 1,
//             limit = 10,
//         } = req.query;

//         const user = req.user?.id?.toString();
//         const role = req.user?.role;

//         if (!referenceWebsite) {
//             return res.status(400).json({ message: "Reference website is required" });
//         }

//         const pageNumber = parseInt(page, 10) || 1;
//         const pageSize = parseInt(limit, 10) || 10;

//         const website = await Websitelist.findById(referenceWebsite);
//         if (!website) {
//             return res.status(404).json({ message: "Reference website not found" });
//         }

//         if (website?.categories.length === 0) {
//             return res.status(200).json({
//                 products: [],
//                 pagination: {
//                     totalDocuments: 0,
//                     currentPage: pageNumber,
//                     pageSize,
//                     totalPages: 0,
//                 },
//             });
//         }

//         const matchStage = {
//             category: { $in: website.categories }, // Only products in website's categories
//         };

//         if (role && role !== "admin") matchStage.addedBy = user;

//         if (category) {
//             matchStage.category = new mongoose.Types.ObjectId(category);
//         }

//         if (search) {
//             matchStage.$or = [
//                 { productName: { $regex: search, $options: 'i' } },
//                 { description: { $regex: search, $options: 'i' } },
//             ];
//         }

//         if (minPrice || maxPrice) {
//             matchStage.actualPrice = {};
//             if (minPrice) matchStage.actualPrice.$gte = parseFloat(minPrice);
//             if (maxPrice) matchStage.actualPrice.$lte = parseFloat(maxPrice);
//         }

//         const pipeline = [
//             { $match: matchStage },
//             {
//                 $lookup: {
//                     from: 'productcategories', // Name of the categories collection
//                     localField: 'category',
//                     foreignField: '_id',
//                     as: 'category',
//                 },
//             },
//             {
//                 $unwind: {
//                     path: '$category',
//                     preserveNullAndEmptyArrays: true,
//                 },
//             },
//             {
//                 $addFields: {
//                     category: {
//                         _id: '$category._id',
//                         name: '$category.name',
//                     },
//                 },
//             },
//             {
//                 $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 },
//             },
//             {
//                 $facet: {
//                     metadata: [
//                         { $count: 'totalDocuments' },
//                         {
//                             $addFields: {
//                                 currentPage: pageNumber,
//                                 pageSize,
//                                 totalPages: { $ceil: { $divide: ['$totalDocuments', pageSize] } },
//                             },
//                         },
//                     ],
//                     products: [
//                         { $skip: (pageNumber - 1) * pageSize },
//                         { $limit: pageSize },
//                     ],
//                 },
//             },
//         ];

//         // Execute the aggregation pipeline
//         const results = await Product.aggregate(pipeline);

//         const metadata = results[0]?.metadata[0] || {
//             totalDocuments: 0,
//             currentPage: pageNumber,
//             pageSize,
//             totalPages: 0,
//         };
//         const products = results[0]?.products || [];

//         // Return the response
//         res.status(200).json({
//             products,
//             pagination: metadata,
//         });
//     } catch (error) {
//         console.error('Error in getProducts:', error.message);
//         res.status(500).json({ message: 'Failed to retrieve products', error: error.message });
//     }
// };
//n

export const getProductDetail = async (req, res) => {
  try {
    const filters = { ...req.query };

    const product = await Product.findById(req.params.id)
      .populate("brand", "name logo")
      .populate("category", "name subcategory")
      // .populate("discount", "discountType value validTill")
      .lean();

    if (!product) return res.status(404).json({ message: "Product not found" });

    let selectedVariant = null;
    selectedVariant = product.variants.find((v) => {
      // Only consider relevant keys from query
      const filterKeys = Object.keys(filters).filter((k) => k !== "referenceWebsite");

      // check each key inside v.options
      return filterKeys.every((key) => {
        return String(v.options[key]) === String(filters[key]);
      });
    });


    if (!selectedVariant && product.variants.length > 0) {
      selectedVariant = product.variants[0];
    }

    res.status(200).json({
      message: "Product retrieved successfully",
      product: {
        ...product,
        selectedVariant,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve product",
      error: error.message,
    });
  }
};

// export const getProductDetail = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }
//     res
//       .status(200)
//       .json({ message: "Product retrieved successfully", product });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Failed to retrieve product", error: error.message });
//   }
// };

//n

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    req.body = JSON.parse(req.body.productData)

    const updateData = { ...req.body };
    console.log("jhgfdsfghjkgfdsghj", updateData);

    // Parse specs if it's a JSON string
    if (updateData.specs && typeof updateData.specs === "string") {
      try {
        updateData.specs = JSON.parse(updateData.specs);
      } catch (err) {
        return res.status(400).json({ message: "Invalid specs JSON format" });
      }
    }
    if (
      updateData.returnPolicy &&
      typeof updateData.returnPolicy === "string"
    ) {
      updateData.returnPolicy = JSON.parse(updateData.returnPolicy);
    }
    if (updateData.warranty && typeof updateData.warranty === "string") {
      updateData.warranty = JSON.parse(updateData.warranty);
    }
    if (updateData.tax && typeof updateData.tax === "string") {
      updateData.tax = JSON.parse(updateData.tax);
    }
    if (
      updateData.dealOfTheDay &&
      typeof updateData.dealOfTheDay === "string"
    ) {
      updateData.dealOfTheDay = JSON.parse(updateData.dealOfTheDay);
    }
    if (req.body.seo && typeof req.body.seo === "string") {
      try {
        req.body.seo = JSON.parse(req.body.seo);
      } catch (err) {
        console.error("Invalid SEO JSON");
      }
    }
    if (
      updateData.attributesFlat &&
      typeof updateData.attributesFlat === "string"
    ) {
      try {
        updateData.attributesFlat = JSON.parse(updateData.attributesFlat);
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Invalid attributesFlat JSON format" });
      }
    }

    // Existing variants parsing logic
    if (updateData.variants) {
      if (typeof updateData.variants === "string") {
        try {
          updateData.variants = JSON.parse(updateData.variants);
        } catch (err) {
          return res
            .status(400)
            .json({ message: "Invalid variants JSON format" });
        }
      }

      updateData.variants.forEach((variant, index) => {
        const variantImageKey = `variantImages_${index}`;
        if (req.files && req.files[variantImageKey]) {
          variant.images = req.files[variantImageKey].map((file) => file.path);
        } else {
          const existingVariant = existingProduct.variants[index];
          if (existingVariant && existingVariant.images) {
            variant.images = existingVariant.images;
          }
        }
      });
    }

    if (
      updateData.actualPrice !== undefined &&
      updateData.price !== undefined &&
      (updateData.actualPrice < 0 || updateData.actualPrice > updateData.price)
    ) {
      return res.status(400).json({
        message:
          "Invalid actualPrice. It must be a positive value and less than or equal to price.",
      });
    }

    if (req.files && req.files.images) {
      updateData.images = req.files.images.map((file) => file.path);
    } else {
      delete updateData.images;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res
      .status(200)
      .json({ message: "Product updated successfully", updatedProduct });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res
      .status(500)
      .json({ message: "Failed to update product", error: error.message });
  }
};

// export const updateProduct = async (req, res) => {
//   try {
//     const {
//       productName,
//       price,
//       actualPrice,
//       discount,
//       category,
//       description,
//       size,
//     } = req.body;
//     let imageArray = [];

//     if (req.file) {
//       imageArray = [req.file.path];
//     } else if (req.files) {
//       imageArray = req.files.map((file) => file.path);
//     }
//     const productSize = size || "M";
//     if (actualPrice < 0 || actualPrice > price) {
//       return res.status(400).json({
//         message:
//           "Invalid actualPrice. It must be a positive value and less than or equal to price.",
//       });
//     }
//     const updatedProduct = await Product.findByIdAndUpdate(
//       req.params.id,
//       {
//         productName,
//         images: imageArray,
//         price,
//         actualPrice: actualPrice || 0,
//         category,
//         description,
//         size: productSize,
//         discount,
//       },
//       { new: true }
//     );

//     if (!updatedProduct) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     res
//       .status(200)
//       .json({ message: "Product updated successfully", updatedProduct });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Failed to update product", error: error.message });
//   }
// };

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
};

export const setDealOfTheDay = async (req, res) => {
  try {
    const { productId, status, durationInHours } = req.body;

    const nowUTC = new Date();

    // Convert to IST (UTC + 5:30)
    const ISTOffset = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(nowUTC.getTime() + ISTOffset);

    let endTime = null;
    if (status && durationInHours) {
      const duration = parseFloat(durationInHours);
      if (isNaN(duration)) {
        return res.status(400).json({ message: "Invalid durationInHours" });
      }
      endTime = new Date(nowIST.getTime() + duration * 60 * 60 * 1000);
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        dealOfTheDay: {
          status: status,
          startTime: status ? nowIST : null,
          endTime: status ? endTime : null,
        },
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: `Deal of the Day ${status ? "activated" : "removed"}`,
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update Deal of the Day",
      error: error.message,
    });
  }
};

export const getDealsOfTheDay = async (req, res) => {
  try {
    const utcNow = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(utcNow.getTime() + istOffset);

    console.log("🕒 Current IST Time:", istTime.toLocaleString());
    console.log("🕒 Current UTC Time:", new Date().toISOString());

    const deals = await Product.find({
      "dealOfTheDay.status": true,
      "dealOfTheDay.startTime": { $lte: istTime },
      "dealOfTheDay.endTime": { $gte: istTime },
    });

    res.status(200).json({
      message: "✅ Active deals fetched successfully",
      deals,
    });
  } catch (error) {
    console.error("❌ Error in getDealsOfTheDay:", error.message);
    res.status(500).json({
      message: "❌ Failed to fetch deals",
      error: error.message,
    });
  }
};


// add-coupon
export const applyCouponOnProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { couponId } = req.body;

    if (couponId == "none") {
      const product = await Product.findByIdAndUpdate(
        productId,
        { $unset: { coupon: "" } }, // remove coupon field
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      await couponModel.updateMany(
        { applicableProducts: productId },
        { $pull: { applicableProducts: productId } }
      );

      return res.json({
        success: true,
        message: "Coupon removed successfully",
        data: product,
      });
    }

    const coupon = await couponModel.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: "Coupon is inactive" });
    }

    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);
    const now = new Date();

    if (now < startDate) {
      return res.status(400).json({ success: false, message: "Coupon is not yet valid" });
    }
    if (now > endDate) {
      return res.status(400).json({ success: false, message: "Coupon has expired" });
    }

    // ✅ Apply coupon to product
    const product = await Product.findByIdAndUpdate(
      productId,
      { coupon: coupon._id },
      { new: true }
    ).populate("coupon");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // ✅ Update coupon with product
    await couponModel.findByIdAndUpdate(
      couponId,
      { $addToSet: { applicableProducts: productId } },
      { new: true }
    );

    res.json({
      success: true,
      message: "Coupon applied successfully",
      data: product,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    referenceWebsite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Websitelist",
      // required: true,
    },
    bannerName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    deviceType: {
      type: String,
      enum: ["mobile", "desktop", "both"],
      default: "both",
    },
    images: {
      type: [String],
      required: true,
    },

    position: {
      type: String,
      enum: ["homepage-top", "homepage-bottom", "sidebar", "footer", "custom"],
      default: "homepage-top",
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

const Banner = mongoose.model("banner", bannerSchema);

export default Banner;

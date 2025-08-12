import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
  {
    referenceWebsite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Websitelist",
    },
    privacyPolicy: { type: String },
    termsAndConditions: { type: String },
    refundPolicy: { type: String },
    shippingPolicy: { type: String },
  },
  { timestamps: true }
);

const policy = mongoose.model("Policy", policySchema);

export default policy;

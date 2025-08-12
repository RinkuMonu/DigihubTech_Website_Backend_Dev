import mongoose from "mongoose";

import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

export const DBConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Error connecting to database:", error.message);
  }
};

// cron.js
import cron from "node-cron";
import Product from "./src/models/Product.model.js";
import { DBConnection } from "./src/db.js";

const runCronJob = async () => {
  try {
    await DBConnection();

    cron.schedule("*/1 * * * *", async () => {
      try {
        const now = new Date();

        const result = await Product.updateMany(
          {
            "dealOfTheDay.status": true,
            "dealOfTheDay.endTime": { $lte: now }
          },
          {
            $set: {
              "dealOfTheDay.status": false,
              "dealOfTheDay.startTime": null,
              "dealOfTheDay.endTime": null
            }
          }
        );

        if (result.modifiedCount > 0) {
          console.log(
            `✅ Auto-expired ${result.modifiedCount} deal(s) at ${now.toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata"
            })}`
          );
        }
      } catch (error) {
        console.error("❌ Cron job error inside schedule:", error.message);
      }
    });

    console.log("✅ Cron job started");
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  }
};

runCronJob();

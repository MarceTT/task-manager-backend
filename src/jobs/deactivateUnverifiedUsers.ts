import cron from "node-cron";
import { UserModel } from "../models/user";

export const scheduleDeactivationJob = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Running job to deactivate unverified users...");
      const result = await UserModel.updateMany(
        { isVerified: false, verificationDeadline: { $lt: new Date() } },
        { isEnable: false }
      );
      console.log(`Deactivated ${result.modifiedCount} unverified users.`);
    } catch (error) {
      console.error("Error running deactivation job:", error);
    }
  });
};

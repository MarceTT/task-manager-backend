import cron from "node-cron";
import { NotificationModel } from "../models/notification";

// Ejecutar tarea diariamente a la medianoche
export const scheduleCleanupJob = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running cleanup job for old notifications...");

    try {
      const result = await NotificationModel.deleteMany({
        createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Más de 30 días
      });

      console.log(`Deleted ${result.deletedCount} old notifications.`);
    } catch (error) {
      console.error("Error during cleanup job:", error);
    }
  });
};

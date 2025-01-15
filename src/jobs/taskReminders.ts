import cron from "node-cron";
import { TaskModel } from "../models/task";
import { getIO } from "../server";

export const taskReminderJob = () => {
  cron.schedule("0 9 * * *", async () => {
    try {
      const io = getIO(); // Obtener instancia del socket

      const today = new Date();
      const tasks = await TaskModel.find({
        dueDate: { $lt: today },
        status: { $ne: "done" },
      });

      tasks.forEach((task) => {
        if (task.assignedTo) {
          io.to(task.assignedTo.toString()).emit("taskReminder", {
            taskId: task._id,
            title: task.title,
            dueDate: task.dueDate,
            message: `Task "${task.title}" is overdue!`,
          });
        }
      });
    } catch (error) {
      console.error("Error running task reminder job:", error);
    }
  });
};

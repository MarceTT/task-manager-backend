import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./swaggerConfig";

import { scheduleDeactivationJob } from "./jobs/deactivateUnverifiedUsers";
import { scheduleCleanupJob } from "./jobs/cleanupNotifications";

import connectToDatabase from "./config/db";
import dotenv from "dotenv";

import { createServer } from "http";
import { setupSocketIO } from "./server";
import authrouter from "./routes/auth";
import taskRouter from "./routes/task";
import notificationRouter from "./routes/notification";
import projectRouter from "./routes/project";
import subtaskRouter from "./routes/subtask";
import { taskReminderJob } from "./jobs/taskReminders";
import userRouter from "./routes/user";

dotenv.config();

const app = express();
const httpServer = createServer(app);

connectToDatabase();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4200"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(bodyParser.json());

// Configurar Socket.IO
setupSocketIO(httpServer); // Separado en un módulo

scheduleDeactivationJob();
scheduleCleanupJob();
taskReminderJob();

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Sirve la documentación en `/api-docs`
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/api/auth", authrouter);
app.use("/api/tasks", taskRouter);
app.use("/api/projects", projectRouter);
app.use("/api/subtasks", subtaskRouter);
app.use("/api/users", userRouter);

app.use("/api/notifications", notificationRouter);



const port = process.env.PORT || 5001;
// Iniciar servidor (usar httpServer en lugar de app)
httpServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

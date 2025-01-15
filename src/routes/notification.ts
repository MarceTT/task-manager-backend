import { Router } from "express";
import {
    filterNotifications,
    getGlobalNotifications,
  getNotifications,
  getTeamNotifications,
  markNotificationsAsRead,
  markTeamNotificationsAsRead,
  sendGlobalNotification,
  sendTeamNotification,
} from "../controllers/notification";

const notificationRouter = Router();

notificationRouter.get("/:userId", getNotifications); // Obtener notificaciones de un usuario
notificationRouter.put("/:userId/read", markNotificationsAsRead); // Marcar como leídas

// Notificaciones para equipos
notificationRouter.get("/team/:teamId", getTeamNotifications); // Obtener notificaciones de un equipo
notificationRouter.put("/team/:teamId/read", markTeamNotificationsAsRead); // Marcar notificaciones de equipo como leídas
notificationRouter.post("/team", sendTeamNotification); // Enviar notificación a un equipo

// Notificaciones globales
notificationRouter.get("/global", getGlobalNotifications); // Obtener notificaciones globales
notificationRouter.post("/global", sendGlobalNotification); // Enviar notificación global

notificationRouter.get("/filter", filterNotifications);


export default notificationRouter;

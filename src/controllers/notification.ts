import { Request, Response } from "express";
import { NotificationModel } from "../models/notification";
import { getIO } from "../server";

// Obtener notificaciones de un usuario
export const getNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const notifications = await NotificationModel.find({ user: userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Marcar notificaciones como leídas
export const markNotificationsAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    await NotificationModel.updateMany(
      { user: userId, read: false },
      { read: true }
    );
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const sendGlobalNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { message } = req.body;

    // Crear una notificación para todos los usuarios (sin un ID específico)
    await NotificationModel.create({
      message,
    });

    // Emitir evento a todos los usuarios conectados
    const io = getIO();
    io.emit("globalNotification", { message });

    res.status(201).json({ message: "Global notification sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const sendTeamNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId, message } = req.body;

    // Crear una notificación para el equipo
    await NotificationModel.create({
      teamId,
      message,
    });

    // Emitir evento a los usuarios en la sala del equipo
    const io = getIO();
    io.to(teamId).emit("teamNotification", { message });

    res.status(201).json({ message: "Notification sent to team successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getTeamNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;
  
      const notifications = await NotificationModel.find({ teamId }).sort({ createdAt: -1 });
      res.status(200).json({ notifications });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  };
  

  // Marcar notificaciones de equipo como leídas
export const markTeamNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;
  
      await NotificationModel.updateMany({ teamId, read: false }, { read: true });
      res.status(200).json({ message: "Team notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  };


// Obtener notificaciones globales
export const getGlobalNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const notifications = await NotificationModel.find({ user: null, teamId: null }).sort({
        createdAt: -1,
      });
      res.status(200).json({ notifications });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  };
  


// Filtros de notificaciones
export const filterNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, teamId, read, startDate, endDate } = req.query;
  
      // Construir filtros dinámicamente
      const filters: any = {};
  
      if (userId) filters.user = userId;
      if (teamId) filters.teamId = teamId;
      if (read !== undefined) filters.read = read === "true";
      if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) filters.createdAt.$gte = new Date(startDate as string);
        if (endDate) filters.createdAt.$lte = new Date(endDate as string);
      }
  
      const notifications = await NotificationModel.find(filters).sort({ createdAt: -1 });
      res.status(200).json({ notifications });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  };
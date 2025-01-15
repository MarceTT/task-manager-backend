import { Request, Response, NextFunction } from "express";
import { UploadRecordModel } from "../models/upload-record";
import { AuthRequest } from "../types/AuthRequest";

const MAX_UPLOAD_SIZE_PER_DAY = 100 * 1024 * 1024; // 100 MB

export const validateUploadLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.authUser?.id; // Suponemos que el usuario está autenticado
    if (!userId) {
       res.status(401).json({ message: "User not authenticated" });
         return;
    }

    // Calcula el tamaño total de los archivos que se están subiendo
    const files = req.files as Express.Multer.File[]; // Archivos actuales
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    // Busca el registro de subidas para hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Elimina horas, minutos y segundos
    const uploadRecord = await UploadRecordModel.findOne({
      userId,
      date: today,
    });

    const currentTotalSize = uploadRecord ? uploadRecord.totalSize : 0;

    // Verifica si el tamaño total supera el límite
    if (currentTotalSize + totalSize > MAX_UPLOAD_SIZE_PER_DAY) {
       res.status(400).json({
        message: "Upload limit exceeded. Maximum 100 MB per day allowed.",
      });
        return;
    }

    // Si no se supera el límite, actualiza o crea el registro
    if (uploadRecord) {
      uploadRecord.totalSize += totalSize;
      await uploadRecord.save();
    } else {
      await UploadRecordModel.create({
        userId,
        date: today,
        totalSize,
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

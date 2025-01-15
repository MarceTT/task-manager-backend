import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const validateObjectId: (param: string) => (req: Request, res: Response, next: NextFunction) => void =
  (param) => (req, res, next) => {
    const id = req.params[param];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: `Invalid ${param}` });
    }

    next(); // Llamar siempre a next() en cualquier caso
  };
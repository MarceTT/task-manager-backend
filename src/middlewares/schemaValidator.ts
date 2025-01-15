import { Request, Response, NextFunction } from "express";
import { ZodError, AnyZodObject, ZodEffects } from "zod";

export const validateSchema =
  (schema: AnyZodObject | ZodEffects<AnyZodObject>) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body); // Valida la solicitud
      next(); // Si es válida, pasa al siguiente middleware
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: err.errors.map((e) => e.message), // Devuelve mensajes de error legibles
        });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  };
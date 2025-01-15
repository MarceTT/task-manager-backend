import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      authUser?: JwtPayload & { id: string; email: string; role: string };
    }
  }
}
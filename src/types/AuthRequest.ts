import { Request } from "express";
import { Roles } from "../config/permissions";

export interface AuthRequest extends Request {
  authUser?: {
    id: string;
    email: string;
    role: Roles;
  };
}

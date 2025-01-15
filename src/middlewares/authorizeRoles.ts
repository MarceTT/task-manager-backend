import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/AuthRequest";
import { rolePermissions,Permissions,  Roles } from "../config/permissions";

export const authorizeRoles = (
  requiredRoles: Roles[],
  requiredPermission: Permissions 
) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.authUser; // Usuario autenticado

    // Verificar si el usuario existe
    if (!user) {
      return res
        .status(403)
        .json({ message: "Access denied: user not authenticated" });
    }

    const userRole = user.role as Roles;

    // Verificar si el rol del usuario está permitido
    if (!requiredRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Access denied: role not allowed" });
    }

    // Verificar si el permiso requerido está en la lista de permisos del rol
    const permissions = rolePermissions[userRole];
    if (!permissions || !permissions.includes(requiredPermission)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient permissions" });
    }

    next();
  };
};

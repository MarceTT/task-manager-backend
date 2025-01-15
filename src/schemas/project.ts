import { z } from "zod";

export const projectSchema = z
  .object({
    name: z
      .string({
        required_error: "Project name is required",
      })
      .min(3, "Project name must be at least 3 characters long")
      .max(100, "Project name must be at most 100 characters long"),
    description: z
      .string()
      .max(500, "Project description must be at most 500 characters long")
      .default("No description provided"),
    users: z
      .array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID"))
      .default([]),
    tasks: z
      .array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid task ID"))
      .default([]),
  })
  .refine((data) => {
    if (data.tasks.length > 0 && data.users.length === 0) {
      return false; // Si hay tareas, debe haber al menos un usuario
    }
    return true;
  }, {
    message: "If tasks are provided, at least one user must be assigned",
    path: ["users"], // Campo que aparece en el error
  });

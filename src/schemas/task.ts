import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(3, "Task title must be at least 3 characters long"),
  description: z
    .string()
    .max(500, "Task description must not exceed 500 characters")
    .optional(),
  status: z
    .enum(["todo", "in-progress", "done"])
    .refine((value) => ["todo", "in-progress", "done"].includes(value), {
      message: "Invalid status. Must be 'todo', 'in-progress', or 'done'.",
    }),
  category: z.string().optional(),
  assignedTo: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid user ID")
    .optional(),
  project: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid project ID")
    .optional(),
  dueDate: z.string().datetime({ offset: true }).optional(),
});

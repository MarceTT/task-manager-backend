import { z } from "zod";

export const subtaskSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must not exceed 100 characters"),
  task: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid task ID"), // Valida un ObjectId
  isCompleted: z.boolean().optional(),
  evidences: z
    .array(
      z.object({
        url: z.string().url("Invalid URL"),
        type: z.enum(["image", "file"]),
        uploadedAt: z.date(),
      })
    )
    .optional(),
});


export const evidenceUploadSchema = z.object({
    evidences: z.array(
      z.object({
        originalname: z.string().min(1, "File must have a name"),
        mimetype: z
          .string()
          .regex(/^(image\/.*|application\/pdf)$/i, "Only images or PDF files are allowed"),
        size: z
          .number()
          .max(10 * 1024 * 1024, "File size must not exceed 10 MB"), // Máximo 10 MB por archivo
      })
    ),
  });
  

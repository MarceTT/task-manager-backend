import express from "express";
import { upload } from "../middlewares/multer";
import { subtaskSchema, evidenceUploadSchema } from "../schemas/subtask";
import { deleteSubtaskEvidence, listFileVersions, listSubtaskEvidences, updateSubtaskEvidence, uploadSubtaskEvidence } from "../controllers/task";
import { validateSchema } from "../middlewares/schemaValidator";
import { validateUploadLimit } from "../middlewares/validateUploadLimit";

const subtaskRouter = express.Router();

// Ruta para subir evidencias (múltiples archivos permitidos)
subtaskRouter.post(
    "/:subtaskId/evidences",
    //validateUploadLimit,
    upload.array("evidences", 10), // Hasta 10 archivos por solicitud
    //validateSchema(evidenceUploadSchema),
    uploadSubtaskEvidence
  );

  subtaskRouter.put(
    "/:subtaskId/evidences/:evidenceId",
    upload.single("evidence"),
    updateSubtaskEvidence
  );

  subtaskRouter.get("/files/:fileKey/versions", listFileVersions);

  subtaskRouter.get("/:subtaskId/evidences", listSubtaskEvidences);
  subtaskRouter.delete("/:subtaskId/evidences", deleteSubtaskEvidence);

export default subtaskRouter;
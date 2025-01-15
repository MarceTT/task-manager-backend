import { Request, Response } from "express";
import { TaskModel } from "../models/task";
import { SubtaskModel } from "../models/subtask";
import { CommentModel } from "../models/comment";
import { getIO } from "../server";
import { s3 } from "../config/awsConfig";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import { ProjectModel } from "../models/project";

export const getAllTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tasks = await TaskModel.find()
      .populate("assignedTo", "firstName lastName email") // Información básica del usuario asignado
      .populate("project", "name"); // Nombre del proyecto relacionado

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      status,
      category,
      assignedTo,
      project,
      dueDate,
    } = req.body;

    const task = await TaskModel.create({
      title,
      description,
      status,
      category,
      assignedTo,
      project,
      dueDate,
    });


    //agregar las tareas asociados al proyecto en el array de tareas qye esta en modelo de proyecto
    if (project) {
      const projectModel = await ProjectModel.findById(project);
      if (projectModel) {
        if (projectModel.tasks) {
          projectModel.tasks.push(task._id as mongoose.Types.ObjectId);
        }
        await projectModel.save();
      }
    }

    const io = getIO();

    // Notificar al usuario asignado
    const userRoom = `user-${assignedTo}`;
    io.to(userRoom).emit("taskCreated", {
      message: `A new task "${title}" has been assigned to you.`,
      task,
    });

    // Notificar al equipo del proyecto (si aplica)
    if (project) {
      const teamRoom = `team-${project}`;
      io.to(teamRoom).emit("teamNotification", {
        message: `A new task "${title}" has been created for project ${project}.`,
        task,
      });
    }

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getTasksByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const tasks = await TaskModel.find({ project: projectId }).populate(
      "assignedTo project"
    );
    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Agregar una subtarea
export const addSubtask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    const subtask = await SubtaskModel.create({ task: taskId, title });

    // Emitir evento de Socket.IO
    // const io = getIO();
    // io.to(taskId).emit("subtaskAdded", {
    //   taskId,
    //   message: `A new subtask "${title}" has been added.`,
    // });
    // console.log(`Event subtaskAdded emitted to room: ${taskId}`);

    res.status(201).json({ message: "Subtask added successfully", subtask });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Completar una subtarea
export const completeSubtask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subtaskId } = req.params;

    const subtask = await SubtaskModel.findById(subtaskId);
    if (!subtask) {
      res.status(404).json({ message: "Subtask not found" });
      return;
    }

    subtask.isCompleted = true;
    await subtask.save();

    // Emitir evento de Socket.IO
    // const io = getIO();
    // io.to(subtask.task.toString()).emit("subtaskCompleted", {
    //   subtaskId,
    //   message: `Subtask "${subtask.title}" has been completed.`,
    // });
    // console.log(
    //   `Event subtaskCompleted emitted to room: ${subtask.task.toString()}`
    // );

    res
      .status(200)
      .json({ message: "Subtask completed successfully", subtask });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Eliminar una subtarea
export const deleteSubtask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subtaskId } = req.params;

    const subtask = await SubtaskModel.findByIdAndDelete(subtaskId);
    if (!subtask) {
      res.status(404).json({ message: "Subtask not found" });
      return;
    }

    res.status(200).json({ message: "Subtask deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Agregar un comentario
export const addComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { user, text } = req.body;

    const comment = await CommentModel.create({ task: taskId, user, text });

    res.status(201).json({ message: "Comment added successfully", comment });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Obtener comentarios de una tarea
export const getComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { taskId } = req.params;

    const comments = await CommentModel.find({ task: taskId }).populate(
      "user",
      "firstName lastName email"
    );

    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const uploadSubtaskEvidence = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subtaskId } = req.params;

    if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
      res.status(400).json({ message: "No files uploaded" });
      return;
    }

    const uploadedFiles = [];

    // Iterar sobre los archivos subidos
    for (const file of req.files as Express.Multer.File[]) {
      const fileKey = `${subtaskId}/${uuidv4()}-${file.originalname}`;

      const params = {
        Bucket: process.env.S3_BUCKET_NAME as string,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      };

      // Subir archivo a S3
      const data = await s3.upload(params).promise();

      // Determinar el tipo del archivo basado en su MIME type
      const type: "image" | "file" = file.mimetype.startsWith("image/")
        ? "image"
        : "file";

      // Agregar la evidencia con `_id`
      uploadedFiles.push({
        _id: new mongoose.Types.ObjectId(),
        url: data.Location,
        type, // Usar el tipo calculado
        uploadedAt: new Date(),
      });
    }

    // Encontrar la subtarea
    const subtask = await SubtaskModel.findById(subtaskId);
    if (!subtask) {
      res.status(404).json({ message: "Subtask not found" });
      return;
    }

    // Añadir las evidencias al array
    subtask.evidences.push(...uploadedFiles);
    await subtask.save();

    const io = getIO();
    // Emitir evento en la sala de la tarea
    const taskRoom = `task-${subtask.task.toString()}`;
    console.log("Emitting evidencesAdded event to room:", taskRoom);
    io.to(taskRoom).emit("evidencesAdded", {
      message: `${uploadedFiles.length} new evidences uploaded.`,
      subtaskId,
      evidences: uploadedFiles,
    });

    console.log(`Evidences added event emitted to room: ${taskRoom}`);
    res.status(201).json({
      message: "Files uploaded successfully",
      evidences: uploadedFiles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const generatePresignedUrl = async (req: Request, res: Response) => {
  try {
    const { subtaskId, fileName } = req.body;

    const fileKey = `${subtaskId}/${uuidv4()}-${fileName}`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: fileKey,
      Expires: 60 * 5, // Expira en 5 minutos
      ContentType: req.body.contentType,
    };

    const url = s3.getSignedUrl("putObject", params);
    res.status(200).json({ url, fileKey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const listSubtaskEvidences = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subtaskId } = req.params;

    // Buscar la subtarea por ID
    const subtask = await SubtaskModel.findById(subtaskId);
    if (!subtask) {
      res.status(404).json({ message: "Subtask not found" });
      return;
    }

    // Obtener las evidencias
    const evidences = subtask.evidences;

    res.status(200).json({
      message: "Evidences retrieved successfully",
      evidences,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const deleteSubtaskEvidence = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subtaskId } = req.params;
    const { evidenceId } = req.body; // IDs de las evidencias a eliminar

    if (!evidenceId || !Array.isArray(evidenceId) || evidenceId.length === 0) {
      res.status(400).json({ message: "No evidence IDs provided" });
      return;
    }

    // Buscar la subtarea
    const subtask = await SubtaskModel.findById(subtaskId);
    if (!subtask) {
      res.status(404).json({ message: "Subtask not found" });
      return;
    }

    const filesToDelete: { Key: string }[] = [];

    // Filtrar las evidencias a eliminar
    const remainingEvidences = subtask.evidences.filter((evidence) => {
      if (evidenceId.includes(evidence._id.toString())) {
        filesToDelete.push({ Key: evidence.url.split("amazonaws.com/")[1] }); // Extraer el Key de S3
        return false; // No incluir en el array restante
      }
      return true; // Mantener en evidences
    });

    if (filesToDelete.length === 0) {
      res
        .status(404)
        .json({ message: "No matching evidences found for deletion" });
      return;
    }

    // Actualizar la subtarea con las evidencias restantes
    subtask.evidences = remainingEvidences;
    await subtask.save();

    // Eliminar los archivos del bucket de S3
    const params = {
      Bucket: process.env.S3_BUCKET_NAME as string,
      Delete: {
        Objects: filesToDelete,
      },
    };

    await s3.deleteObjects(params).promise();

    res.status(200).json({
      message: "Evidences deleted successfully",
      deletedEvidences: filesToDelete.map((file) => file.Key),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const updateSubtaskEvidence = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subtaskId, evidenceId } = req.params;

    // Verificar si el archivo fue subido
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const file = req.file;
    const fileKey = `${subtaskId}/${uuidv4()}-${file.originalname}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // Subir el nuevo archivo a S3
    const uploadResponse = await s3.upload(params).promise();

    // Buscar la subtarea
    const subtask = await SubtaskModel.findById(subtaskId);
    if (!subtask) {
      res.status(404).json({ message: "Subtask not found" });
      return;
    }

    // Buscar la evidencia dentro de la subtarea
    const evidence = subtask.evidences.find(
      (e) => e._id.toString() === evidenceId
    );
    if (!evidence) {
      res.status(404).json({ message: "Evidence not found" });
      return;
    }

    // Actualizar la evidencia con la nueva URL
    const previousVersionUrl = evidence.url; // Guarda la versión anterior si necesitas rastrearla
    evidence.url = uploadResponse.Location;
    evidence.uploadedAt = new Date();

    // Guardar los cambios
    await subtask.save();

    res.status(200).json({
      message: "Evidence updated successfully",
      newVersion: evidence.url,
      previousVersion: previousVersionUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const listFileVersions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { fileKey } = req.params; // El Key del archivo en S3

    const params = {
      Bucket: process.env.S3_BUCKET_NAME as string,
      Prefix: fileKey, // El Key base del archivo
    };

    // Listar versiones del archivo
    const versions = await s3.listObjectVersions(params).promise();

    res.status(200).json({
      message: "File versions retrieved successfully",
      versions: versions.Versions?.map((version) => ({
        versionId: version.VersionId,
        lastModified: version.LastModified,
        size: version.Size,
        isLatest: version.IsLatest,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }



};


export const updateStatusTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await TaskModel.findById(taskId);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    task.status = status;
    await task.save();

    res.status(200).json({ message: "Task status updated successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};


//funcion para editar la tarea completa, es decir cualquier campo que se pueda editar
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, category, assignedTo, dueDate, percent } = req.body;

    const task = await TaskModel.findById(taskId);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    task.title = title;
    task.description = description;
    task.status = status;
    task.category = category;
    task.assignedTo = assignedTo;
    task.dueDate = dueDate;
    task.percent = percent;

    await task.save();

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

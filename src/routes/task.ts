import { Router } from "express";
import { validateSchema } from "../middlewares/schemaValidator";
import { verifyToken } from "../middlewares/verifyToken";
import {
  getAllTasks,
  createTask,
  getTasksByProject,
  addSubtask,
  completeSubtask,
  deleteSubtask,
  addComment,
  getComments,
  updateStatusTask,
  updateTask
} from "../controllers/task";
import { validateObjectId } from "../middlewares/validateId";

const taskRouter = Router();

// Ruta para crear una nueva tarea
taskRouter.post("/", createTask);

// Obtener todas las tareas
taskRouter.get("/", getAllTasks);

// Ruta para obtener tareas por proyecto
taskRouter.get(
  "/project/:projectId",
  validateObjectId("projectId"),
  getTasksByProject
);

// Ruta para actualizar el estado de una tarea
taskRouter.put("/:taskId/status", validateObjectId("taskId"), updateStatusTask);

//Ruta para editar la tarea completa, es decir cualquier campo que se pueda editar
taskRouter.put("/:taskId", validateObjectId("taskId"),updateTask);

taskRouter.post("/:taskId/subtasks", validateObjectId("taskId"), addSubtask); // Agregar subtarea
taskRouter.put("/:taskId/subtasks/:subtaskId", validateObjectId("taskId"), validateObjectId("subtaskId"), completeSubtask); // Completar subtarea
taskRouter.delete("/:taskId/subtasks/:subtaskId", validateObjectId("taskId"), validateObjectId("subtaskId"), deleteSubtask); // Eliminar subtarea

taskRouter.post("/:taskId/comments", validateObjectId("taskId"), addComment); // Agregar comentario
taskRouter.get("/:taskId/comments", validateObjectId("taskId"), getComments); // Obtener comentarios

export default taskRouter;

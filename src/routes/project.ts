import { Router } from "express";
import { validateSchema } from "../middlewares/schemaValidator";
import { verifyToken } from "../middlewares/verifyToken";
import { projectSchema } from "../schemas/project";
import {
  createProject,
  getProject,
  getAllProjects,
  updateProject,
  deleteProject,
  getProjectTasks,
} from "../controllers/project";
import { validateObjectId } from "../middlewares/validateId";

const projectRouter = Router();

// Crear un proyecto
projectRouter.post(
  "/",
  //verifyToken,
  validateSchema(projectSchema),
  createProject
);

// Obtener todos los proyectos
projectRouter.get("/", getAllProjects);

// Obtener un proyecto por ID
projectRouter.get(
  "/:projectId",
  //verifyToken,
  validateObjectId("projectId"),
  getProject
);

// Actualizar un proyecto
projectRouter.put(
  "/:projectId",
  //verifyToken,
  validateObjectId("projectId"),
  validateSchema(projectSchema),
  updateProject
);

// Eliminar un proyecto
projectRouter.delete(
  "/:projectId",
  //verifyToken,
  validateObjectId("projectId"),
  deleteProject
);

// Obtener tareas relacionadas con un proyecto
projectRouter.get(
  "/:projectId/tasks",
  //verifyToken,
  validateObjectId("projectId"),
  getProjectTasks
);


//obtener el conteo de las tareas asociadas a un proyecto
projectRouter.get(
  "/:projectId/taskCount",
  //verifyToken,
  validateObjectId("projectId"),
  getProjectTasks
);

export default projectRouter;

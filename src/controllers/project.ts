import { Request, Response } from "express";
import { ProjectModel } from "../models/project";
import { TaskModel } from "../models/task";

export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, users, tasks } = req.body;

    const project = await ProjectModel.create({
      name,
      description,
      users,
      tasks,
    });

    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Obtener un proyecto por ID
export const getProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.params;

    const project = await ProjectModel.findById(projectId)
      .populate("users", "firstName lastName email") // Popula información básica de los usuarios
      .populate("tasks", "title status dueDate"); // Popula información básica de las tareas

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Obtener todos los proyectos pero tambien contar las tareas asociadas a cada proyecto
export const getAllProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const projects = await ProjectModel.find()
      .populate("users", "firstName lastName email")
      .populate("tasks");

      //contar las tareas asociadas a cada proyecto

    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Actualizar un proyecto
export const updateProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { name, description, users, tasks } = req.body;

    const project = await ProjectModel.findByIdAndUpdate(
      projectId,
      { name, description, users, tasks },
      { new: true, runValidators: true } // Devuelve el proyecto actualizado y aplica validaciones
    );

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.status(200).json({ message: "Project updated successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Eliminar un proyecto
export const deleteProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.params;

    const project = await ProjectModel.findByIdAndDelete(projectId);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Obtener tareas relacionadas con un proyecto
export const getProjectTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.params;

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    const tasks = await TaskModel.find({ _id: { $in: project.tasks } });
    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

//obtener el conteo de las tareas asociadas a un proyecto pero desde el modelo de Tareas ya que desde ahi esta almacenado el _id del proyecto
export const getProjectTaskCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.params;

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    const taskCount = await TaskModel.countDocuments({ project: projectId });
    res.status(200).json({ taskCount });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }

};

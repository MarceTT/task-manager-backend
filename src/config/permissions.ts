export const rolePermissions: Record<string, string[]> = {
  superadmin: ["createProject", "manageUsers", "viewAnalytics", "deleteTasks"],
  admin: ["createProject", "manageUsers", "viewTasks"],
  manager: ["createTask", "assignUsers", "viewOwnProjects"],
  user: ["completeTask", "viewAssignedTasks"],
};

// Tipos basados en `rolePermissions`
export type RolePermissions = typeof rolePermissions;
export type Roles = keyof RolePermissions;
export type Permissions = RolePermissions[Roles][number];
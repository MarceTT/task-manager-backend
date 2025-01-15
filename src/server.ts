import { Server, Socket } from "socket.io";
import { createServer } from "http";
import jwt from "jsonwebtoken";

let io: Server | null = null;

const JWT_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

/**
 * Configura y exporta la instancia de Socket.IO
 */
export const setupSocketIO = (
  httpServer: ReturnType<typeof createServer>
): Server => {
  io = new Server(httpServer, {
    cors: { origin: "http://localhost:5000" },
  });

  // Middleware para autenticar conexiones
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token; // Obtener el token del handshake

    // Log del token recibido
    console.log("Token received:", token);

    if (!token) {
      console.error("Authentication error: Token is missing");
      return next(new Error("Authentication error: Token is missing"));
    }
    console.log("JWT Secret:", process.env.JWT_SECRET);

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("Decoded token:", decoded);
      socket.data.user = decoded;
      next();
    } catch (err) {
      console.error("Authentication error: Invalid token", err);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    // Obtener el `userId` del query string
    // const userId = socket.handshake.query.userId as string;
    const user = socket.data.user;
    const userId = socket.data.user?.id;
    const tasks = socket.data.user?.tasks || []; // Lista de IDs de tareas asignadas al usuario
    const teams = socket.data.user?.teams || [];

    if (!user) {
      console.error("User is not authenticated");
      socket.disconnect(); // Desconectar si no está autenticado
      return;
    }

    // Sala del usuario
    const userRoom = `user-${userId}`;
    socket.join(userRoom);
    console.log(`User ${userId} joined room: ${userRoom}`);

    // Salas de tareas
    tasks.forEach((taskId: string) => {
      const taskRoom = `task-${taskId}`;
      socket.join(taskRoom);
      console.log(`User ${userId} joined room: ${taskRoom}`);
    });

    // Salas de equipos/proyectos
    teams.forEach((teamId: string) => {
      const teamRoom = `team-${teamId}`;
      socket.join(teamRoom);
      console.log(`User ${userId} joined room: ${teamRoom}`);
    });

    // Unir al usuario a sus salas de tareas (simulación)
    const taskRooms = [`task-123`, `task-675a22cdb0e75711ff411552`]; // Reemplaza con IDs reales
    taskRooms.forEach((room) => {
      socket.join(room);
      console.log(`User ${userId} joined room: ${room}`);
    });

    /// Manejar unirse a salas específicas
    socket.on("joinRoom", (roomId, callback) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room: ${roomId}`);
      callback({ status: "joined", roomId });
    });

    // Manejar evento de prueba
    socket.on("testEvent", (data, callback) => {
      console.log(`Test event received from ${userId}:`, data);
      callback({ status: "success", receivedData: data });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${user.id}`);
    });
  });

  return io;
};

/**
 * Obtener la instancia de Socket.IO
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO is not initialized. Call setupSocketIO first.");
  }
  return io;
};

import { io } from "socket.io-client";

const userId = "675a2e46e47f42e14d189659"; // Reemplaza con el ID real del usuario
const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NWEyZTQ2ZTQ3ZjQyZTE0ZDE4OTY1OSIsImVtYWlsIjoibXRvcm82QGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzM0MjI4NTU4LCJleHAiOjE3MzQ4MzMzNTh9.j18LpDyJISnd-E1_N_G09By-SUiKGzsUAW_CLD09XTo";
const socket = io("http://localhost:5000", {
  auth: {
    token: accessToken, // Enviar el token en el handshake
  },
});

console.log("Token sent to server:", accessToken);

// Verificar conexión
socket.on("connect", () => {
  console.log("Connected to the server");

  // Unirse a una sala específica (por ejemplo, una tarea)
  socket.emit("joinRoom", "task-675a22cdb0e75711ff411552", (response: any) => {
    console.log("Joined room:", response);
  });
});

// Escuchar evento de tarea creada
socket.on("taskCreated", (data) => {
  console.log("Task Created:", data);
});

// Escuchar notificaciones de evidencia subida
socket.on("evidencesAdded", (data) => {
  console.log("Evidences Added Event Received:", data);
});

// Emitir evento de prueba
socket.emit("testEvent", { message: "Hello from client" }, (response: any) => {
  console.log("Test event response:", response);
});

// Escuchar eventos personalizados
socket.on("evidencesAdded", (data) => {
console.log("Evidences Added Event Received:", data);
});

// Manejar errores de conexión
socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});

// Desconectar cuando sea necesario
socket.on("disconnect", () => {
  console.log("Disconnected from the server");
});

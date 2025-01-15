import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Límite de 10 solicitudes por ventana
  message: {
    status: 429,
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true, // Devuelve información en los headers `RateLimit-*`
  legacyHeaders: false, // Desactiva headers `X-RateLimit-*`
});

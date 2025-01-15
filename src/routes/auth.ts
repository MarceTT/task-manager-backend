import { Router } from "express";
import { validateSchema } from "../middlewares/schemaValidator";
import { loginSchema, registerSchema } from "../schemas/auth";
import { login, logout, me, refreshToken, register, updateReminderTime } from "../controllers/auth";
import { verifyToken } from "../middlewares/verifyToken";
import { loginRateLimiter } from "../middlewares/rateLimit";

const authrouter = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "jwt-token"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
authrouter.post("/login", validateSchema(loginSchema), loginRateLimiter, login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               profilePicture:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               isEnable:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *       400:
 *         description: Validation error
 */
authrouter.post("/register", validateSchema(registerSchema), register);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
authrouter.get("/me", verifyToken, me);

authrouter.get("/refresh-token", refreshToken);

authrouter.post("/logout", logout);

authrouter.put("/reminder-time", verifyToken, updateReminderTime);

export default authrouter;

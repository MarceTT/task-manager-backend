import { Request, Response } from "express";
import { createUser, getUserByEmail, UserModel } from "../models/user";
import { AuthRequest } from "../types/AuthRequest";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendEmail } from "../config/sendEmail";

const generateAccessToken = (payload: object, duration: string) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: duration,
  });
};

const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d",
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Verificar la contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    // Datos para el payload del token
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    // Generar tokens
    const accessToken = generateAccessToken(payload, "15m");
    const refreshToken = generateRefreshToken(payload);

    // Almacenar el refresh token en cookies HTTP-only
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Solo en HTTPS en producción
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    // return res.status(200).json({ token });
    res
      .status(200)
      .json({ message: "Login successful", accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, profilePicture, isEnable } =
      req.body;

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Genera el token de verificación
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationDeadline = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Hashear la contraseña antes de almacenarla
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      firstName,
      lastName,
      email,
      password: hashedPassword, // Almacena la contraseña hasheada
      profilePicture: profilePicture || null, // Opcional
      isEnable: isEnable ?? true, // Por defecto: habilitado
      isVerified: false,
      verificationToken,
      verificationDeadline,
    };

    const newUser = await createUser(user);

    // // Enviar email de verificación
    // const verificationLink = `http://localhost:5001/api/auth/verify-email?token=${verificationToken}`;
    // await sendEmail(
    //   newUser.email,
    //   "Verify Your Email",
    //   `Please verify your email by clicking this link: ${verificationLink}`
    // );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token) {
      res.status(400).json({ message: "Verification token is required" });
      return;
    }

    const user = await UserModel.findOne({ verificationToken: token });
    if (
      !user ||
      !user.verificationDeadline ||
      user.verificationDeadline < new Date()
    ) {
      res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
      return;
    }

    // Actualiza el estado del usuario
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationDeadline = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const me = (req: AuthRequest, res: Response): void => {
  if (!req.authUser) {
    res
      .status(401)
      .json({ message: "Unauthorized: No user information available" });
    return;
  }

  const { id, email, role } = req.authUser;

  res.status(200).json({
    message: "User profile retrieved successfully",
    user: {
      id,
      email,
      role,
    },
  });
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token not provided" });
    return;
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as {
      id: string;
      email: string;
      role: string;
    };

    // Generar un nuevo Access Token
    const accessToken = generateAccessToken(
      {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      },
      "15m"
    );

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateReminderTime = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.authUser) {
      res
        .status(401)
        .json({ message: "Unauthorized: No user information available" });
      return;
    }
    const userId = req.authUser.id; // ID del usuario autenticado
    const { reminderTime } = req.body;

    if (
      !reminderTime ||
      typeof reminderTime !== "number" ||
      reminderTime <= 0
    ) {
      res
        .status(400)
        .json({ message: "Invalid reminder time. Must be a positive number." });
      return;
    }

    // Actualiza el tiempo de recordatorio del usuario
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { reminderTime },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    console.log(
      `User ${userId} updated their reminder time to ${reminderTime} minutes.`
    );

    res
      .status(200)
      .json({ message: "Reminder time updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

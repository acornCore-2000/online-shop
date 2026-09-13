import { Router, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/Db.js";
import { randomUUID } from "crypto";
import { authLimiter } from "../middleware/rateLimiter.js";
import { AppError } from "../middleware/errorHandler.js";
import { assertValid } from "../middleware/requestValidation.js";


const router = Router();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

router.post("/signup", authLimiter, async (req, res, next: NextFunction) => {
  try {
    const { email, password, fullname } = req.body;

    assertValid(
      typeof email === "string" &&
        typeof password === "string" &&
        typeof fullname === "string" &&
        email.trim().length > 0 &&
        password.length > 0 &&
        fullname.trim().length > 0,
      "Email, password and fullname are required",
    );

    if (!validateEmail(email)) {
      throw new AppError(400, "Please enter a valid email address");
    }

    if (password.length < 12) {
      throw new AppError(400, "Password must be at least 12 characters");
    }
    if (!ACCESS_TOKEN_SECRET) {
      throw new Error("ACCESS_TOKEN_SECRET is not defined");
    }
    if (!REFRESH_TOKEN_SECRET) {
      throw new Error("REFRESH_TOKEN_SECRET is not defined");
    }
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rowCount !== 0) {
      throw new AppError(409, "This email is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id",
      [email, hashedPassword, fullname],
    );

    const user = newUser.rows[0];
    const uuid = randomUUID();
    const accessToken = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
      algorithm: "HS256",
    });

    const refreshToken = jwt.sign({ id: user.id, uuid:uuid }, REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
      algorithm: "HS256",
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const hashedRToken = await bcrypt.hash(refreshToken, 10);
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at, device_uuid) VALUES ($1, $2, $3, $4)",
      [user.id, hashedRToken, expiresAt, uuid],
    );

    res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
      secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

    res.cookie("accessToken", accessToken, {
  httpOnly: true,
      secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 15 * 60 * 1000,
}); 


    res.status(201).json({
      success: true,
      message: "User created successfully",
      user
    });

  } catch (error) {
    return next(error);
  }
});

export default router;

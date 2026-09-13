import { Router, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/Db.js";
import { randomUUID } from "crypto";
import { AppError } from "../middleware/errorHandler.js";
import { assertValid } from "../middleware/requestValidation.js";
import { authLimiter } from "../middleware/rateLimiter.js";


const router = Router();

router.post('/login', authLimiter, async (req, res, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    assertValid(
      typeof email === "string" &&
        /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email.trim()),
      "A valid email address is required",
    );
    assertValid(typeof password === "string" && password.length > 0, "Password is required");

    const accessSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!accessSecret || !refreshSecret) {
      throw new AppError(500, "JWT secrets are not configured");
    }

    const result = await pool.query(
      "SELECT password_hash, id FROM users WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      throw new AppError(401, "Invalid email or password.");
    }

    const user = result.rows[0];

    const passwordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordValid) {
      throw new AppError(401, "Invalid email or password.");
    }

    const uuid = randomUUID();

    const accessToken = jwt.sign(
      {
        id: user.id,
        uuid,
      },
      accessSecret,
      {
        expiresIn: "15m",
        algorithm: "HS256",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        uuid,
      },
      refreshSecret,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      }
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await pool.query(
      `INSERT INTO refresh_tokens
       (user_id, token, expires_at, device_uuid)
       VALUES ($1, $2, $3, $4)`,
      [
        user.id,
        hashedRefreshToken,
        expiresAt,
        uuid,
      ]
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



    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
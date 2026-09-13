import { Router, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/Db.js";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();

interface RefreshPayload {
  id: number;
  uuid: string;
}

router.post("/refresh", async (req, res, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (typeof refreshToken !== "string" || refreshToken.length === 0) {
      throw new AppError(401, "Refresh token required");
    }

    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    const accessSecret = process.env.ACCESS_TOKEN_SECRET;

    if (!refreshSecret || !accessSecret) {
      throw new AppError(500, "JWT secrets are not configured");
    }

    const decoded = jwt.verify(refreshToken, refreshSecret, {
      algorithms: ["HS256"],
    });

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.id !== "number" ||
      typeof decoded.uuid !== "string"
    ) {
      throw new AppError(401, "Invalid refresh token");
    }

    const payload = decoded as RefreshPayload;

    const result = await pool.query(
      `SELECT token
       FROM refresh_tokens
       WHERE user_id = $1 AND device_uuid = $2`,
      [payload.id, payload.uuid],
    );

    const hashedRefreshToken = result.rows[0]?.token;

    if (!hashedRefreshToken) {
      throw new AppError(401, "Invalid refresh token");
    }

    const tokenValid = await bcrypt.compare(
      refreshToken,
      hashedRefreshToken,
    );

    if (!tokenValid) {
      throw new AppError(401, "Invalid refresh token");
    }

    const newAccessToken = jwt.sign(
      {
        id: payload.id,
        uuid: payload.uuid,
      },
      accessSecret,
      {
        expiresIn: "15m",
        algorithm: "HS256",
      },
    );

    const newRefreshToken = jwt.sign(
      {
        id: payload.id,
        uuid: payload.uuid,
      },
      refreshSecret,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      },
    );

    const newHashedRefreshToken = await bcrypt.hash(
      newRefreshToken,
      10,
    );

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    await pool.query(
      `UPDATE refresh_tokens
       SET token = $1, expires_at = $2
       WHERE user_id = $3 AND device_uuid = $4`,
      [
        newHashedRefreshToken,
        expiresAt,
        payload.id,
        payload.uuid,
      ],
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Token refreshed successfully",
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
import { Router, NextFunction } from "express";
import pool from "../config/Db.js";
import { requireAuth } from "../middleware/checkAuth.js";
import bcrypt from "bcrypt";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();

router.post("/logout", requireAuth, async (req, res, next: NextFunction) => {
  try {
    const result = await pool.query(
      "SELECT token FROM refresh_tokens WHERE user_id=$1 AND device_uuid=$2",
      [req.user.id, req.user.uuid],
    );
    const refreshToken = req.cookies?.refreshToken;
    if (typeof refreshToken !== "string" || refreshToken.length === 0) {
      
        throw new AppError(401, "Invalid refresh token");
      
    }
    const hashedRefreshToken = result.rows[0]?.token;
    if (!hashedRefreshToken) {
      throw new AppError(401, "Invalid refresh token");
    }
    const compareTokens = await bcrypt.compare(
      refreshToken,
      hashedRefreshToken,
    );

    if (!compareTokens) {
  throw new AppError(401, "Invalid refresh token");
} 
   
      await pool.query(
        "DELETE FROM refresh_tokens WHERE user_id = $1 AND device_uuid = $2",
        [req.user.id, req.user.uuid],
      );
    

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });


    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return next(error);
  }
});

export default router;

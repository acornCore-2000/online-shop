import { Router, NextFunction } from "express";
import pool from "../config/Db.js";
import { requireAuth } from "../middleware/checkAuth.js";
import { AppError } from "../middleware/errorHandler.js";
import { assertValid } from "../middleware/requestValidation.js";
import { strictLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.get("/profile-info", requireAuth, async (req, res, next: NextFunction) => {
  try {
    const response = await pool.query(
      "SELECT full_name, email, phone_number, avatar_url, address FROM users WHERE id= $1",
      [req.user.id],
    );
    res.status(200).json({ userInfo: response.rows[0] });
  } catch (error) {
    return next(error);
  }
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

router.patch("/profile-info/email", requireAuth, strictLimiter,  async (req, res, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      throw new AppError(400, "Email is required.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    assertValid(normalizedEmail.length <= 254, "Invalid email address.");

    if (normalizedEmail.length > 254 || !EMAIL_REGEX.test(normalizedEmail)) {
      throw new AppError(400, "Invalid email address.");
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND id <> $2",
      [normalizedEmail, req.user.id],
    );

    if (existing.rows.length > 0) {
      throw new AppError(409, "This email is already in use.");
    }

    const response = await pool.query(
      `UPDATE users
          SET email = $1
        WHERE id = $2
      RETURNING full_name, email, phone_number, avatar_url, address`,
      [normalizedEmail, req.user.id],
    );

    if (response.rows.length === 0) {
      throw new AppError(404, "User not found.");
    }

    res.status(200).json({ userInfo: response.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.patch("/profile-info/full-name", requireAuth, strictLimiter, async (req, res, next: NextFunction) => {
  try {
    const { full_name } = req.body;

    if (typeof full_name !== "string" || !full_name.trim()) {
      throw new AppError(400, "Full name is required.");
    }

    const normalizedFullName = full_name.trim();
    assertValid(normalizedFullName.length <= 100, "Full name is too long.");

    const response = await pool.query(
      `UPDATE users
          SET full_name = $1
        WHERE id = $2
      RETURNING full_name, email, phone_number, avatar_url, address`,
      [normalizedFullName, req.user.id],
    );

    if (response.rows.length === 0) {
      throw new AppError(404, "User not found.");
    }

    res.status(200).json({ userInfo: response.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.patch("/profile-info/phone-number", requireAuth, strictLimiter, async (req, res, next: NextFunction) => {
  try {
    const { phone_number } = req.body;
    const PHONE_REGEX = /^09\d{9}$/;
    
    if (typeof phone_number !== "string" || !phone_number.trim()) {
      throw new AppError(400, "Phone number is required.");
    }

    const normalizedPhoneNumber = phone_number.trim();
    assertValid(normalizedPhoneNumber.length <= 20, "Invalid phone number.");
  const isValid = PHONE_REGEX.test(normalizedPhoneNumber);


    if (!isValid) {
      throw new AppError(400, "Invalid phone number.");
    }

  

    const existing = await pool.query(
      "SELECT id FROM users WHERE phone_number = $1 AND id <> $2",
      [normalizedPhoneNumber, req.user.id],
    );

    if (existing.rows.length > 0) {
      throw new AppError(409, "This phone number is already in use.");
    }

    const response = await pool.query(
      `UPDATE users
          SET phone_number = $1
        WHERE id = $2
      RETURNING full_name, email, phone_number, avatar_url, address`,
      [normalizedPhoneNumber, req.user.id],
    );

    if (response.rows.length === 0) {
      throw new AppError(404, "User not found.");
    }

    res.status(200).json({ userInfo: response.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.patch("/profile-info/address", requireAuth, async (req, res, next: NextFunction) => {
  try {
    const { address } = req.body;

    if (typeof address !== "string" || !address.trim()) {
      throw new AppError(400, "Address is required.");
    }

    const normalizedAddress = address.trim();
    assertValid(normalizedAddress.length <= 500, "Address is too long.");

    const response = await pool.query(
      `UPDATE users
          SET address = $1
        WHERE id = $2
      RETURNING full_name, email, phone_number, avatar_url, address`,
      [normalizedAddress, req.user.id],
    );

    if (response.rows.length === 0) {
      throw new AppError(404, "User not found.");
    }

    res.status(200).json({ userInfo: response.rows[0] });
  } catch (error) {
    return next(error);
  }
});

export default router;

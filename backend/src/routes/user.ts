import { Router, NextFunction } from "express";
import { requireAuth } from "../middleware/checkAuth.js";

const router = Router();

router.get("/me", requireAuth, async (req, res, next: NextFunction) => {
  try {
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
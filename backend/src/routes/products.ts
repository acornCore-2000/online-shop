import { Router, NextFunction } from "express";
import pool from "../config/Db.js";
import { assertValid } from "../middleware/requestValidation.js";


const router = Router();

router.get("/remained-products", async (req, res, next: NextFunction) => {
  try {
    const result = await pool.query("SELECT uuid, quantity FROM products");
    res.status(200).json({remainedProducts: result.rows});
    
  } catch (error) {
    return next(error);
  }
});


router.get("/products", async (req, res, next: NextFunction) => {
  try {
    const { gender, season, category } = req.query;
    assertValid(
      typeof gender === "string" && gender.trim().length > 0 &&
      typeof season === "string" && season.trim().length > 0 &&
      typeof category === "string" && category.trim().length > 0,
      "Gender, season, and category are required",
    );

    const result = await pool.query(
      `SELECT
        id,
        uuid,
        name,
        price,
        quantity,
        season,
        gender,
        colors,
        description,
        category,
        image_url
       FROM products
       WHERE gender = $1
       AND season = $2
       AND category = $3
       ORDER BY id ASC`,
      [gender, season, category],
    );

    return res.status(200).json({
      products: result.rows,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;

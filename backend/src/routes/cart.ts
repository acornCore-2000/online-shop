import pool from "../config/Db.js";
import { requireAuth } from "../middleware/checkAuth.js";
import { AppError } from "../middleware/errorHandler.js";
import { assertValid, isPositiveInteger } from "../middleware/requestValidation.js";
import { Router, NextFunction } from "express";
import { generalLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.get("/fetch-cart", requireAuth, async (req, res, next: NextFunction) => {
  try {
    const userId = req.user.id;

    const hasCart = await pool.query(
      "SELECT * FROM cart_items WHERE user_id = $1",
      [userId],
    );

    if (hasCart.rowCount !== 0) {
      const fetchCart = await pool.query(
        "SELECT ci.id, ci.product_id, ci.quantity, ci.user_id, p.id, p.name, p.price, p.image_url FROM cart_items ci JOIN products p ON p.id = ci.product_id JOIN users u ON u.id = ci.user_id WHERE ci.user_id = $1 ORDER BY ci.added_at DESC;",
        [userId],
      );

      return res.status(200).json({
        cart: fetchCart.rows,
      });
    } else {
      return res.status(200).json({
        empty: true,
        cart: [],
        message: "Your cart is empty.",
      });
    }
  } catch (error) {
    return next(error);
  }
});

router.post("/add-to-cart", requireAuth, generalLimiter, async (req, res, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const product_id = req.body.product_id;
    assertValid(isPositiveInteger(product_id), "A valid product id is required");

    const stock = await pool.query("SELECT quantity FROM products WHERE id=$1", [product_id]);
    assertValid(stock.rowCount !== 0, "Product not found");
    if (stock.rows[0].quantity === 0){
      throw new AppError(409, "Out of stock.");
    }
    const isAdded = await pool.query(
      "SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [user_id, product_id],
    );



    if (isAdded.rows.length > 0) {
      const productQuantity = await pool.query(
        "SELECT quantity FROM products WHERE id = $1",
        [product_id],
      );


      if (productQuantity.rows[0]?.quantity === 0) {
        throw new AppError(409, "You've reached the maximum available quantity for this product.");
      }

      const updateDB = await pool.query(
        "UPDATE cart_items SET quantity = quantity + 1 WHERE user_id = $1 AND product_id = $2 RETURNING *",
        [user_id, product_id],
      );

      const updateProductQuantity = await pool.query(
        "UPDATE products SET quantity = quantity - 1 WHERE id = $1 RETURNING quantity",
        [product_id],
      );

      return res.status(200).json({
        cart: updateDB.rows,
        productQuantity: updateProductQuantity.rows[0].quantity,
      });
    }

    const insertDB = await pool.query(
      "INSERT INTO cart_items (product_id, user_id) VALUES ($1, $2) RETURNING *",
      [product_id, user_id],
    );

    const updateProductQuantity2 = await pool.query(
        "UPDATE products SET quantity = quantity - 1 WHERE id = $1 RETURNING quantity",
        [product_id],
      );

    return res.status(201).json({
      cart: insertDB.rows,
      productQuantity: updateProductQuantity2.rows[0].quantity,
    });
  } catch (error) {
    return next(error);
  }
});

router.patch("/remove-from-cart", requireAuth,  generalLimiter, async (req, res, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const product_id = req.body.product_id;

    assertValid(isPositiveInteger(product_id), "A valid product id is required");
    const isAdded = await pool.query(
      "SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [user_id, product_id],
    );

    if (isAdded.rows.length === 0) {
      throw new AppError(404, "Product is not in the cart");
    }

    if (isAdded.rows[0].quantity <= 1 ) {
      await pool.query(
        "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2",
        [user_id, product_id],
      );

      const updateProductQuantity = await pool.query(
        "UPDATE products SET quantity = quantity + 1 WHERE id = $1 RETURNING quantity",
        [product_id],
      );
          const isEmpty = await pool.query("SELECT * FROM cart_items WHERE user_id =$1", [user_id])


      return res.status(200).json({
        itemQuantity: 0,
        productQuantity: updateProductQuantity.rows[0].quantity,
        isEmpty: isEmpty.rowCount === 0 ? true : false
      });
    }

    const updateDB = await pool.query(
      "UPDATE cart_items SET quantity = quantity - 1 WHERE user_id = $1 AND product_id = $2 RETURNING *",
      [user_id, product_id],
    );

    const updateProductQuantity = await pool.query(
      "UPDATE products SET quantity = quantity + 1 WHERE id = $1 RETURNING quantity",
      [product_id],
    );


    return res.status(200).json({
      cart: updateDB.rows,
      productQuantity: updateProductQuantity.rows[0].quantity,
      
    });

  } catch (error) {
    return next(error);
  }
});

export default router;
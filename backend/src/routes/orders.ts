import { Router, NextFunction } from "express";
import { requireAuth } from "../middleware/checkAuth.js";
import pool from "../config/Db.js";
import { strictLimiter } from "../middleware/rateLimiter.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  assertAllowed,
  assertValid,
  isPositiveInteger,
  isUuid,
} from "../middleware/requestValidation.js";
import {
  calculateOrderTotals,
  orderNameRegex,
  orderPhoneRegex,
} from "./orderValidation.js";

const router = Router();

router.post("/place-order", requireAuth, strictLimiter, async (req, res, next: NextFunction) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const cartState = await client.query(
      `SELECT ci.product_id, ci.quantity, p.price
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1
       ORDER BY ci.id ASC
       FOR UPDATE OF ci`,
      [req.user.id],
    );

    if (cartState.rows.length === 0) {
      throw new AppError(400, "Your cart is empty.");
    }

    const orderUuid = crypto.randomUUID();

    await Promise.all(
      cartState.rows.map(async (item) => {
        await client.query(
          `INSERT INTO orders
            (product_id, user_id, price, quantity, status, order_uuid)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *;`,
          [
            item.product_id,
            req.user.id,
            Number(item.price),
            item.quantity,
            "pending",
            orderUuid,
          ],
        );
      }),
    );

    await client.query("DELETE FROM cart_items WHERE user_id = $1", [
      req.user.id,
    ]);

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Order placed successfully.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

router.get("/pending-orders", requireAuth, async (req, res, next: NextFunction) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 AND status = $2",
      [req.user.id, "pending"],
    );

    const { quantity, totalPrice } = calculateOrderTotals(result.rows);

    return res.status(200).json({
      info: {
        quantity,
        totalPrice,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/pending-orders/items", requireAuth, async (req, res, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT p.id AS product_id, p.name, p.price, p.image_url, o.quantity, o.order_uuid
       FROM products p
       JOIN orders o ON p.id = o.product_id
       WHERE o.user_id = $1 AND o.status = $2
       ORDER BY o.id ASC;`,
      [req.user.id, "pending"],
    );

    return res.status(200).json({ items: result.rows });
  } catch (error) {
    return next(error);
  }
});

router.patch("/pending-orders/items/:productId", requireAuth, async (req, res, next: NextFunction) => {
  const client = await pool.connect();

  try {
    const productId = Number(req.params.productId);
    const { action } = req.body;

    assertValid(
      isPositiveInteger(productId) && ["increase", "decrease"].includes(action),
      "A valid product id and action are required.",
    );

    await client.query("BEGIN");

    const pendingOrder = await client.query(
      `SELECT id, quantity
       FROM orders
       WHERE product_id = $1 AND user_id = $2 AND status = $3
       ORDER BY id ASC
       LIMIT 1
       FOR UPDATE;`,
      [productId, req.user.id, "pending"],
    );

    if (pendingOrder.rowCount === 0) {
      await client.query("ROLLBACK");
      const otherUserOrder = await pool.query(
        "SELECT user_id FROM orders WHERE product_id = $1 AND status = $2 LIMIT 1",
        [productId, "pending"],
      );
      assertAllowed(otherUserOrder.rowCount === 0);
      throw new AppError(404, "Pending item not found.");
    }

    const orderId = pendingOrder.rows[0].id;
    const currentQuantity = Number(pendingOrder.rows[0].quantity);

    if (action === "increase") {
      const stock = await client.query(
        `UPDATE products
         SET quantity = quantity - 1
         WHERE id = $1 AND quantity > 0
         RETURNING quantity;`,
        [productId],
      );

      if (stock.rowCount === 0) {
        await client.query("ROLLBACK");
        throw new AppError(409, "Out of stock.");
      }

      const updatedOrder = await client.query(
        `UPDATE orders
         SET quantity = quantity + 1
         WHERE id = $1
         RETURNING quantity;`,
        [orderId],
      );

      await client.query("COMMIT");
      return res.status(200).json({
        itemQuantity: updatedOrder.rows[0].quantity,
        productQuantity: stock.rows[0].quantity,
      });
    }

    const stock = await client.query(
      `UPDATE products
       SET quantity = quantity + 1
       WHERE id = $1
       RETURNING quantity;`,
      [productId],
    );

    if (currentQuantity <= 1) {
      await client.query("DELETE FROM orders WHERE id = $1", [orderId]);
    } else {
      await client.query(
        `UPDATE orders
         SET quantity = quantity - 1
         WHERE id = $1;`,
        [orderId],
      );
    }

    await client.query("COMMIT");
    return res.status(200).json({
      itemQuantity: Math.max(currentQuantity - 1, 0),
      productQuantity: stock.rows[0].quantity,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

router.delete("/cancel-pending-orders", requireAuth, strictLimiter, async (req, res, next: NextFunction) => {
  try {
    const result = await pool.query(
      "DELETE FROM orders WHERE user_id = $1 AND status = $2",
      [req.user.id, "pending"],
    );

    return res.status(200).json({
      message: "All pending orders have been cancelled.",
      deletedCount: result.rowCount,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/orders", requireAuth, strictLimiter, async (req, res, next: NextFunction) => {
  try {
    const { fullName, phoneNumber, address } = req.body;

    assertValid(
      typeof fullName === "string" &&
        typeof phoneNumber === "string" &&
        typeof address === "string" &&
        fullName.trim().length > 0 &&
        phoneNumber.trim().length > 0 &&
        address.trim().length > 0,
      "All fields are required.",
    );

    const trimmedName = fullName.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedAddress = address.trim();

    if (!orderNameRegex.test(trimmedName)) {
      throw new AppError(400, "Please enter a valid first and last name.");
    }

    if (!orderPhoneRegex.test(trimmedPhone)) {
      throw new AppError(400, "Please enter a valid phone number.");
    }

    if (!trimmedAddress) {
      throw new AppError(400, "Please enter a valid address.");
    }

    const pendingOrdersInfo = await pool.query(
      "SELECT total_price, order_uuid FROM orders WHERE user_id=$1 AND status = $2",
      [req.user.id, "pending"],
    );

    if (pendingOrdersInfo.rows.length === 0) {
      throw new AppError(400, "No pending orders found.");
    }

    const orderUuid = pendingOrdersInfo.rows[0].order_uuid;
    const { totalPrice } = calculateOrderTotals(pendingOrdersInfo.rows);

    await pool.query(
      `
      INSERT INTO confirmed_orders
        (user_id, full_name, phone_number, address, total_price, order_uuid)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, full_name, phone_number, address,
                total_price, status, created_at
      `,
      [
        req.user.id,
        trimmedName,
        trimmedPhone,
        trimmedAddress,
        totalPrice.toFixed(2),
        orderUuid,
      ],
    );

    await pool.query(
      "UPDATE orders SET status = $1 WHERE user_id = $2 AND order_uuid=$3",
      ["under review", req.user.id, orderUuid],
    );

    return res.status(201).json({
      message: "Order successfully placed.",
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/fetch-checkout-info", requireAuth, async (req, res, next: NextFunction) => {
  try {
    const pendingOrders = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 AND status = $2",
      [req.user.id, "pending"],
    );

    const userInfo = await pool.query(
      "SELECT full_name, phone_number, address FROM users WHERE id = $1",
      [req.user.id],
    );

    const address = userInfo.rows[0].address;
    const phone_number = userInfo.rows[0].phone_number;
    const fullName = userInfo.rows[0].full_name;

    const { quantity, totalPrice } = calculateOrderTotals(pendingOrders.rows);

    return res.status(200).json({
      checkoutInfo: {
        totalPrice,
        quantity,
        address,
        phone_number,
        fullName,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/confirmed-orders", requireAuth, async (req, res, next: NextFunction) => {
  try {
    const result = await pool.query(
      "SELECT total_price, created_at, order_uuid, status FROM confirmed_orders WHERE user_id=$1 AND status != 'delivered'",
      [req.user.id],
    );

    return res.status(200).json({
      confirmedOrders: result.rows,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/delivered-orders", requireAuth, async (req, res, next: NextFunction) => {
  try {
    const result = await pool.query(
      "SELECT total_price, created_at, order_uuid, status FROM confirmed_orders WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC",
      [req.user.id, "delivered"],
    );

    return res.status(200).json({
      deliveredOrders: result.rows,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/confirmed-orders/:uuid/items", requireAuth, async (req, res, next: NextFunction) => {
  try {
    const uuid = req.params.uuid;
    assertValid(isUuid(uuid), "A valid order id is required.");

    const result = await pool.query(
      "SELECT p.id AS product_id, p.name, p.price, p.image_url, o.quantity, o.order_uuid FROM products p JOIN orders o ON p.id = o.product_id WHERE o.order_uuid = $1 AND o.user_id = $2 ORDER BY o.id ASC;",
      [uuid, req.user.id],
    );

    if (result.rowCount === 0) {
      const otherUserOrder = await pool.query(
        "SELECT user_id FROM orders WHERE order_uuid = $1 LIMIT 1",
        [uuid],
      );
      assertAllowed(otherUserOrder.rowCount === 0);
      throw new AppError(404, "Not Found");
    }

    return res.status(200).json({ items: result.rows });
  } catch (error) {
    return next(error);
  }
});

router.get("/delivered-orders/:uuid/items", requireAuth, async (req, res, next: NextFunction) => {
  try {
    assertValid(isUuid(req.params.uuid), "A valid order id is required.");
    const result = await pool.query(
      `SELECT p.id AS product_id, p.name, p.price, p.image_url,
              o.quantity, o.order_uuid, r.status AS return_status
       FROM products p
       JOIN orders o ON p.id = o.product_id
       JOIN confirmed_orders c ON c.order_uuid = o.order_uuid
       LEFT JOIN returns r
         ON r.order_uuid = o.order_uuid::text
        AND r.product_id = o.product_id
        AND r.user_id = o.user_id
       WHERE o.order_uuid = $1
         AND o.user_id = $2
         AND c.user_id = $2
         AND c.status = $3
       ORDER BY o.id ASC;`,
      [req.params.uuid, req.user.id, "delivered"],
    );

    if (result.rowCount === 0) {
      const otherUserOrder = await pool.query(
        "SELECT user_id FROM orders WHERE order_uuid = $1 LIMIT 1",
        [req.params.uuid],
      );
      assertAllowed(otherUserOrder.rowCount === 0);
      throw new AppError(404, "Not Found");
    }

    return res.status(200).json({ items: result.rows });
  } catch (error) {
    return next(error);
  }
});

router.post("/returns", requireAuth, strictLimiter,  async (req, res, next: NextFunction) => {
  const client = await pool.connect();

  try {
    const { orderUuid, productIds, reason } = req.body;
    assertValid(isUuid(orderUuid), "A valid order id is required.");
    const parsedProductIds = Array.isArray(productIds)
      ? [...new Set(productIds.map(Number))]
      : [];
    const trimmedReason = typeof reason === "string" ? reason.trim() : "";

    if (
      parsedProductIds.length === 0 ||
      parsedProductIds.some((productId) => !Number.isInteger(productId)) ||
      !trimmedReason ||
      trimmedReason.length > 1000
    ) {
      throw new AppError(400, "Order, products, and return reason are required.");
    }

    await client.query("BEGIN");

    const orderCheck = await client.query(
      `SELECT DISTINCT o.product_id
       FROM orders o
       JOIN confirmed_orders c ON c.order_uuid = o.order_uuid
       WHERE o.order_uuid = $1
         AND o.product_id = ANY($2::int[])
         AND o.user_id = $3
         AND c.user_id = $3
         AND c.status = $4`,
      [orderUuid.trim(), parsedProductIds, req.user.id, "delivered"],
    );

    const validProductIds = orderCheck.rows.map((row) => Number(row.product_id));
    const allProductsBelongToOrder = parsedProductIds.every((productId) =>
      validProductIds.includes(productId),
    );

    if (!allProductsBelongToOrder) {
      await client.query("ROLLBACK");
      const otherUserOrder = await pool.query(
        "SELECT user_id FROM orders WHERE order_uuid = $1 LIMIT 1",
        [orderUuid],
      );
      assertAllowed(otherUserOrder.rowCount === 0);
      throw new AppError(404, "One or more delivered order items were not found.");
    }

    const existingReturn = await client.query(
      `SELECT product_id
       FROM returns
       WHERE user_id = $1
         AND order_uuid = $2
         AND product_id = ANY($3::int[])
         AND status IN ('return_requested', 'accepted')`,
      [req.user.id, orderUuid.trim(), parsedProductIds],
    );

    if ((existingReturn.rowCount ?? 0) > 0) {
      await client.query("ROLLBACK");
      throw new AppError(409, "A return request already exists for one or more selected items.");
    }

    const createdReturns = [];

    for (const productId of parsedProductIds) {
      const result = await client.query(
        `INSERT INTO returns (user_id, order_uuid, product_id, reason)
         VALUES ($1, $2, $3, $4)
         RETURNING id, user_id, order_uuid, product_id, status, reason, created_at`,
        [req.user.id, orderUuid.trim(), productId, trimmedReason],
      );

      createdReturns.push(result.rows[0]);
    }

    await client.query("COMMIT");

    return res.status(201).json({ returnRequests: createdReturns });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

router.delete(
  "/confirmed-orders/:orderUuid/cancel",
  requireAuth, strictLimiter, 
  async (req, res, next: NextFunction) => {
    const { orderUuid } = req.params;
    const userId = req.user.id;
    assertValid(isUuid(orderUuid), "A valid order id is required.");

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const orderResult = await client.query(
        `
        SELECT order_uuid
             , user_id
        FROM orders
        WHERE order_uuid = $1
        FOR UPDATE
        `,
        [orderUuid],
      );

      if (orderResult.rowCount === 0) {
        await client.query("ROLLBACK");

        throw new AppError(404, "Order not found");
      }

      assertAllowed(Number(orderResult.rows[0].user_id) === userId);

      await client.query(
        `
        DELETE FROM confirmed_orders
        WHERE order_uuid = $1
        `,
        [orderUuid],
      );

      await client.query(
        `
        DELETE FROM orders
        WHERE order_uuid = $1
          AND user_id = $2
        `,
        [orderUuid, userId],
      );

      await client.query("COMMIT");

      return res.status(200).json({
        message: "Order cancelled successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      return next(error);
    } finally {
      client.release();
    }
  },
);

export default router;
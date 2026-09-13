import "dotenv/config";
import express from "express";
import helmet from "helmet";
import path from "path";
import cookieParser from "cookie-parser";
import { corsMiddleware } from "./src/config/corsConfig.js";
import signupRouter from "./src/routes/signup.js";
import logoutRouter from "./src/routes/logout.js";
import loginRouter from "./src/routes/login.js";
import refreshRouter from "./src/routes/refresh.js";
import productRouter from "./src/routes/products.js";
import ordersRouter from "./src/routes/orders.js";
import userRouter from "./src/routes/user.js";
import cartRouter from "./src/routes/cart.js";
import profileRouter from "./src/routes/profile.js";
import { AppError, errorHandler } from "./src/middleware/errorHandler.js";

const app = express();


const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

const __dirname = import.meta.dirname;

app.use(express.static(path.join(__dirname, "../public")));

app.use(
  helmet({
    contentSecurityPolicy: true,
  }),
);

app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());

app.use("/api", signupRouter);
app.use("/api", loginRouter);
app.use("/api", logoutRouter);
app.use("/api", refreshRouter);
app.use("/api", productRouter);
app.use("/api", ordersRouter);
app.use("/api", userRouter);
app.use("/api", cartRouter);
app.use("/api", profileRouter);

app.use((req, res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.path} not found`));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`
)});

require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {errorMiddleware} from "./middleware/error";
import userRouter from "./routes/user.route";

export const app = express();

// Body parser
app.use(express.json({ limit: "50mb" }));

// Cookie parser
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

// Routes

app.use("/api/v1", userRouter);

// Health check/test API
app.get("/test", (req: Request, res: Response) => {
  res.status(200).json({ 
    success: true,
    message: "API is working",
  });
});

// Catch-all for undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
  const err: any = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

// Error handler middleware (should be last)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.use(errorMiddleware);


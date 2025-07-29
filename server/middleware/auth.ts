import { Request, Response, NextFunction } from "express";
import catchAsyncError from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt from "jsonwebtoken";
import { redis } from "../utils/redis";


/**
 * Middleware to check if the user is authenticated.
 * It verifies the JWT token from cookies and retrieves the user from Redis.
 */
export const isAuthenticated = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
      return next(
        new ErrorHandler("Please login to access this resource", 401)
      );
    }

    const decoded = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN as string
    ) as { id: string };

    if (!decoded) {
      return next(new ErrorHandler("Invalid access token", 401));
    }

    const user= await redis.get(decoded.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    req.user = JSON.parse(user);
    next();
  }
);

/**
 * Middleware to check if the user is an admin.
 * It checks the user's role from the request object.
 */

export const authrizeRoles = (...roles: string[]) =>
{
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role || "")) {
            return next(
                new ErrorHandler(`Role: ${req.user?.role || ""} is not allowed to access this resource`, 403)
            );
        }
        next();
    }
}
 
import ErrorHandler from "../utils/ErrorHandler";
import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Default status and message
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // CastError (mongoose)
    if (err.name === "CastError") {
        message = `Resource not found. Invalid: ${err.path}`;
        statusCode = 400;
        err = new ErrorHandler(message, statusCode);
    }

    // Duplicate key error (mongoose)
    if (err.code === 11000) {
        message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        statusCode = 400;
        err = new ErrorHandler(message, statusCode);
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        message = "Json Web Token is invalid, try again";
        statusCode = 400;
        err = new ErrorHandler(message, statusCode);
    }

    if (err.name === "TokenExpiredError") {
        message = "Json Web Token is expired, try again";
        statusCode = 400;
        err = new ErrorHandler(message, statusCode);
    }

    res.status(statusCode).json({
        success: false,
        message,
    });
};

export default errorMiddleware;
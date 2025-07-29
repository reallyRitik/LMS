import { Request } from "express";
import { IUser } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Optional user property for authenticated requests
    }
  }
}
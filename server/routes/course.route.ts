import express from "express";
import { uploadCourse } from "../controllers/course.controller";
import { authrizeRoles, isAuthenticated } from "../middleware/auth";

const courseRouter = express.Router();
// Course upload route
courseRouter.post("/create-course", isAuthenticated, authrizeRoles("admin"), uploadCourse);

export default courseRouter;
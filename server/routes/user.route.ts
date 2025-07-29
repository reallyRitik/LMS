import express from "express";
import { activateUser, loginUser, logoutUser, registerUser } from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth";

const userRouter = express.Router();

// User registration route
userRouter.post("/registration", registerUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAuthenticated , logoutUser);

export default userRouter;
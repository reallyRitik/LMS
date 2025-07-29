import express from "express";
import { activateUser, getUserInfo, loginUser, logoutUser, registerUser, updateAccessToken } from "../controllers/user.controller";
import { authrizeRoles, isAuthenticated } from "../middleware/auth";

const userRouter = express.Router();

// User registration route
userRouter.post("/registration", registerUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAuthenticated, logoutUser);
userRouter.get("/refresh", updateAccessToken);
userRouter.get("/me", isAuthenticated, getUserInfo);

export default userRouter;
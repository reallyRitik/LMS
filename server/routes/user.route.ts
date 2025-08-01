import express from "express";
import { activateUser, getUserInfo, loginUser, logoutUser, registerUser, socialAuth, updateAccessToken, updatePassword, updateProfilePicture, updateUserInfo } from "../controllers/user.controller";
import { authrizeRoles, isAuthenticated } from "../middleware/auth";

const userRouter = express.Router();

// User registration route
userRouter.post("/registration", registerUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAuthenticated, logoutUser);
userRouter.get("/refresh", updateAccessToken);
userRouter.get("/me", isAuthenticated, getUserInfo);
userRouter.post("/social-auth", socialAuth)
userRouter.put("/update-user-info", isAuthenticated, updateUserInfo)
userRouter.put("/update-user-password", isAuthenticated, updatePassword)
userRouter.put("/update-user-avatar", isAuthenticated, updateProfilePicture)

export default userRouter;
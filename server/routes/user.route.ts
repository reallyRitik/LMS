import express from "express";
import { activateUser, loginUser, logoutUser, registerUser } from "../controllers/user.controller";

const userRouter = express.Router();

// User registration route
userRouter.post("/registration", registerUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", logoutUser);

export default userRouter;
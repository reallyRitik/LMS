require("dotenv").config();
import e, { Request, Response, NextFunction } from "express";
import userModel from "../models/user.model";
import { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import Jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import { sendToken } from "../utils/jwt";
import { access } from "fs";
import { redis } from "../utils/redis";

// Register user
interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: {
    public_id: string;
    url: string;
  };
}

export const registerUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, avatar } = req.body;
      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exists", 400));
      }

      const user: IRegistrationBody = {
        name,
        email,
        password,
        avatar,
      };

      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;
      const data = { user: { name: user.name }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation-mail.ejs"),
        data
      );

      try {
        await sendMail({
          email: user.email,
          subject: "Account Activation",
          template: "activation-mail.ejs",
          data,
        });
        res.status(201).json({
          success: true,
          message: `Please check your email : ${user.email} for activation link`,
          activationToken: activationToken.token,
        });
      } catch (error) {
        return next(new ErrorHandler("Error sending activation email", 500));
      }
    } catch (error) {
      return next(new ErrorHandler("Error registering user", 500));
    }
  }
);

interface IActivationToken {
  token: string;
  activationCode: string;
}

// Function to create activation token
const createActivationToken = (user: IRegistrationBody): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = Jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET as Secret,
    { expiresIn: "5m" }
  );
  return { token, activationCode };
};

//Activate user account

interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as IActivationRequest;
      if (!activation_token || !activation_code) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Activation token and code are required",
          });
      }
      let newUser;
      try {
        newUser = Jwt.verify(
          activation_token,
          process.env.ACTIVATION_SECRET as string
        ) as { user: IRegistrationBody; activationCode: string };
      } catch (err) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Invalid or expired activation token",
          });
      }
      if (newUser.activationCode !== activation_code) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid activation code" });
      }
      const { name, email, password, avatar } = newUser.user;
      const existUser = await userModel.findOne({ email });
      if (existUser) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }
      const user = await userModel.create({
        name,
        email,
        password,
        avatar,
      });
      res.status(201).json({
        success: true,
        message: "User activated successfully",
        user,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error activating user" });
    }
  }
);

// Login user

interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;
      if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
      }

      const user = await userModel.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
      }

      const isPasswordMatched = await user.comparePassword(password);
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


//logOut user

export const logoutUser = catchAsyncErrors(async(req:Request, res:Response, next: NextFunction)=>{
  try{
    const cookieOptions = {
      maxAge: 1,
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      domain: "localhost" // Change to your actual domain in production
    };
    res.cookie("access_token", "", cookieOptions);
    res.cookie("refresh_token", "", cookieOptions);
    // Remove user session from Redis
    const userId = req.user?._id || "";
    redis.del(userId);

    res.status(200).json({
      success: true,
      message: "Logged Out Successfully"
    });
  } catch (error:any){
    return next(new ErrorHandler(error.message, 400));
  }
});
require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import userModel from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import Jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";

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

export const registerUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
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
    const data = {user: {name:user.name}, activationCode};
    const html = await ejs.renderFile(path.join(__dirname, "../views/activationEmail.ejs"), data);
    // You can send activationToken to user's email here
    res.status(201).json({
      success: true,
      message: "User registered successfully. Activation token sent.",
      activationToken,
    });
  } catch (error) {
    return next(new ErrorHandler("Error registering user", 500));
  }
});

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
    { expiresIn: "1d" }
  );
  return { token, activationCode };
};
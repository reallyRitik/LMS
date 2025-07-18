import express from "express";
import mongoose from "mongoose";
require("dotenv").config();

const dbUrl = process.env.DB_URI || "";

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl).then((data:any) => {
        console.log(`MongoDB connected to ${data.connection.host}:${data.connection.port}`);
    });
    console.log("MongoDB connected successfully");
  } catch (error:any) {
    console.error("MongoDB connection error:", error);
    setTimeout(connectDB, 5000);
}}

export default connectDB;
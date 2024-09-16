import  express  from "express";
import { db } from "../config/db";
import { Request,Response,NextFunction } from "express";
import asyncHandler from "express-async-handler";
import jwt  from "jsonwebtoken";
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
  };
export const createOtp=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    
})
import  express  from "express";
import { db } from "../config/db";
import { Request,Response,NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { otpTable } from "../models/userTable";
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
  };

const createAndSend=async(userId:string)=>{
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
  await db.insert(otpTable).values({
    userId,
    otp,
    expiresAt
  });
  return otp;
};

export {createAndSend};
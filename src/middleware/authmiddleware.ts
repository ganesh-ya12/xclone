import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { userTable } from "../models/userTable";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { db } from '../config/db';
import { eq } from "drizzle-orm";

dotenv.config();

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt;
    const jwtSecret = process.env.JWT_SECRET as string;

    console.log("Token:", token);

    if (!token) {
        res.status(401).json({ message: "Unauthorized, Login to continue" });
        return;
    }

    try {
        const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;

        console.log("Decoded:", decoded);

        const user = await db.select().from(userTable).where(eq(userTable.email, decoded.email)).execute();

        if (user.length === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        req.user = user[0]; // Attach the user to the request object
        next();
    } catch (err) {
        console.error("JWT verification error:", err);
        res.status(401).json({ message: "Invalid token" });
    }
});

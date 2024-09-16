import asyncHandler from "express-async-handler";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from '../config/db';
import { userTable } from '../models/userTable';
import { Request, Response, NextFunction } from "express";
import { eq, noopEncoder, or } from "drizzle-orm";
import expressAsyncHandler from "express-async-handler";
import path from "path";
import { error } from "console";
import isEmail from "validator/lib/isEmail";
import { decode } from "punycode";
import { use } from "passport";

const jwtSecret = process.env.JWT_SECRET as string;

const usernamechecks=async(userId:string)=>
  {
    const usererrors: string[] = [];
    if(validator.contains(userId," ")){
      usererrors.push("userId cannot contain spaces");
    }
    if(validator.matches(userId,/[A-Z]/)){
      usererrors.push("userId cannot contain a captial letter");
    }
    if(userId.length<2){
      usererrors.push("userId should be atleast 2 characters long");
    }
    if(userId.length>30){
      usererrors.push("userId should not contaon more than 30 characters");
      }
      return usererrors;
  }
  const validationsChecks = async (
    email: string,
    password: string,
    confirmPass: string,
    username: string,
    userId: string
) => {
    const errors: {
        username: string[];
        userId: string[];
        password: string[];
        email: string[];
    } = {
        username: [],
        userId: [],
        password: [],
        email: []
    };

    if (username.length > 40) {
        errors.username.push("Name can't be greater than 40 characters");
    }
    if (!validator.isEmail(email)) {
        errors.email.push("Enter a valid email");
    }
    if (password !== confirmPass) {
        errors.password.push("The passwords don't match");
    }
    if (!validator.isLength(password, { min: 8 })) {
        errors.password.push("Password: Minimum 8 characters required");
    }
    if (!validator.isStrongPassword(password)) {
        errors.password.push("Password is not strong");
    }
    const usernameChecker = await usernamechecks(userId);
    if (usernameChecker.length > 0) {
        errors.userId.push(...usernameChecker);
    }

    const userIdExists = await db.select().from(userTable).where(
        eq(userTable.userId, userId)
    );
    const emailExistence = await db.query.userTable.findFirst({
      where:eq(userTable.email,email)
    });
    if (userIdExists.length > 0) {
        errors.userId.push("Username already exists");
    }
    if (emailExistence) {
        errors.email.push("Email already exists");
    }
    return errors;
};


export const signUp = asyncHandler(async (req: Request, res: Response,next:NextFunction) => {
    const { username, email, userId, password,confirmPass, dob, bio, profileImageUrl } = req.body;
    
    const errors=await validationsChecks(email,password,confirmPass,username,userId);

    for (const key of Object.keys(errors) as (keyof typeof errors)[]) {
      const errorArray = errors[key];
      if (errorArray.length > 0) {
         res.status(400).json({ errors });
         return ;
         
      }
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await db.insert(userTable).values({
        userId,
        username,
        password: hashedPassword,
        dob,
        email,
        bio,
        profileImageUrl,
    }).returning({ userId: userTable.userId ,email:userTable.email}).execute();

    const token = jwt.sign(
        { userId: user[0].userId ,email:user[0].email},
        jwtSecret,
        { expiresIn: "30d" }
    );

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });

    res.status(201).json({ message: "User registered successfully", userId: user[0].userId,token:token });
});


export const jwtLogin = asyncHandler(async (req: Request, res: Response) => {
    const { emailOruser, password } = req.body;

    const User = await db.select().from(userTable).where(
      or(
      eq(userTable.email, emailOruser),
      eq(userTable.userId,emailOruser)
  )).limit(1).execute();
  console.log(User)
      
    if (User.length === 0) {
        res.status(401).json({ errors: "Username/Email not found" });
        return;
    }

    const isMatch = await bcrypt.compare(password, User[0].password);

    if (!isMatch) {
        res.status(401).send("Incorrect password");
        return;
    }

    const token = jwt.sign(
        { userId: User[0].userId ,email:User[0].email},
        jwtSecret,
        { expiresIn: "30d" }
    );

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });

    res.status(200).json({ message: "Logged in successfully" ,access_token:token});
});
export const logOut=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
          try {
            const token = req.cookies.jwt;
        
            if (!token) {
                res.status(401).json({ message: "User not logged in" });
                return;
            }
            res.clearCookie("jwt",{
              path:'/',
             httpOnly:true,
             secure:true,
             sameSite:"none"}
            );
            res.status(200).json({message:"logged out succesfully"})
            
          } catch (error) {
            console.log(error)
            res.status(500).json({message:"Error logging out"})
            
          }
});
export const getUserDetails=asyncHandler(async(req:Request,res:Response)=>{
  const token=req.cookies.jwt;
  jwt.verify(token,jwtSecret,async (err:jwt.VerifyErrors|null, decoded:any)=>
  {
    if(err){
      return res.status(400).json({message:"User Not found"});
    }
    try {
      const user = await db.select().from(userTable).where(eq(userTable.email, decoded.email) );

      if (user.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

    return res.status(200).json({
      userId:user[0].userId,
      name:user[0].username,
      email:user[0].email,
      profilepic:user[0].profileImageUrl
    })
  }catch(error){
     return res.status(500).json({ message: (error as Error).message });
  }
  
  })
});
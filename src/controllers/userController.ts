import asyncHandler from "express-async-handler";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { db } from '../config/db';
import { userTable } from '../models/userTable';
import { Request, Response, NextFunction } from "express";
import { ConsoleLogWriter, and, eq, noopEncoder, or } from "drizzle-orm";
import { createAndSend } from "./otpController";
import expressAsyncHandler from "express-async-handler";
import path from "path";
import { Console, error } from "console";
import isEmail from "validator/lib/isEmail";
import { decode } from "punycode";
import { use } from "passport";
import { sendMail } from "./mailServic";

const jwtSecret = process.env.JWT_SECRET as string;

const usernamechecks = async (userId: string) => {
  const usererrors: string[] = [];
  if (validator.contains(userId, " ")) {
    usererrors.push("userId cannot contain spaces");
  }
  if (validator.matches(userId, /[A-Z]/)) {
    usererrors.push("userId cannot contain a captial letter");
  }
  if (userId.length < 2) {
    usererrors.push("userId should be atleast 2 characters long");
  }
  if (userId.length > 30) {
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
    where: eq(userTable.email, email)
  });
  if (userIdExists.length > 0) {
    errors.userId.push("Username already exists");
  }
  if (emailExistence) {
    errors.email.push("Email already exists");
  }
  return errors;
};


export const signUp = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, userId, password, confirmPass, dob, bio, profileImageUrl } = req.body;

  const errors = await validationsChecks(email, password, confirmPass, username, userId);

  for (const key of Object.keys(errors) as (keyof typeof errors)[]) {
    const errorArray = errors[key];
    if (errorArray.length > 0) {
      res.status(400).json({ errors });
      return;

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
  }).returning({ userId: userTable.userId, email: userTable.email }).execute();

  const token = jwt.sign(
    { userId: user[0].userId, email: user[0].email },
    jwtSecret,
    { expiresIn: "30d" }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.status(201).json({ message: "User registered successfully", userId: user[0].userId, token: token });
});


export const jwtLogin = asyncHandler(async (req: Request, res: Response) => {
  const { emailOruser, password } = req.body;

  const User = await db.select().from(userTable).where(
    or(
      eq(userTable.email, emailOruser),
      eq(userTable.userId, emailOruser)
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
    { userId: User[0].userId, email: User[0].email },
    jwtSecret,
    { expiresIn: "30d" }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.status(200).json({ message: "Logged in successfully", access_token: token });
});
export const logOut = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      res.status(401).json({ message: "User not logged in" });
      return;
    }
    res.clearCookie("jwt", {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: "none"
    }
    );
    res.status(200).json({ message: "logged out succesfully" })

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error logging out" })

  }
});
export const getUserDetails = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.jwt;
  jwt.verify(token, jwtSecret, async (err: jwt.VerifyErrors | null, decoded: any) => {
    if (err) {
      return res.status(400).json({ message: "User Not found" });
    }
    try {
      const user = await db.select().from(userTable).where(eq(userTable.email, decoded.email));

      if (user.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        userId: user[0].userId,
        name: user[0].username,
        email: user[0].email,
        profilepic: user[0].profileImageUrl
      })
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }

  })
});

export const editProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { profiledetails } = req.body;
  const token = req.cookies.jwt;

  if (!token) {
    res.status(401).json({ message: "Unauthorized access" });
    return;
  }
  const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET as string)
  if (!profiledetails || Object.keys(profiledetails).length === 0) {
    res.status(400).json({ message: "No profile details provided" });
    return;
  }
  const decodedUserID = decodedToken.userId;
  const changedProfile = await db.update(userTable)
    .set(profiledetails)
    .where(eq(userTable.userId, decodedUserID));
  if (!changedProfile) {
    res.status(400).json({ message: "Unable to change the profile details" });
    return;
  }
  res.status(200).json({ message: "Profile changed successfully" });
});


export const checkPassword = async (req: Request, res: Response,next:NextFunction):Promise<Response> => {
  const { password } = req.body;
  const token = req.cookies.jwt;
  if (!token) {
    res.status(401).json({ message: "Unauthorised please login to change password " });
    // return false;

  }
  let decodedUserId: string | undefined;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
    //console.log(decodedToken);
     decodedUserId = (decodedToken as jwt.JwtPayload).userId;
 console.log(decodedUserId);

  }
  catch (error) {
    return res.status(401).json({ message: "Invalid or expired token. Please login again." });
    // return false;
  }
  if (!decodedUserId) {
    return res.status(401).json({ message: "Failed to extract user ID from token." });
    // return false;
  }
  const User = await db.query.userTable.findFirst({ where: eq(userTable.userId, decodedUserId) }).execute()
  if (!User) {
    return res.status(400).json({ message: "User not found." });
    // return false;
  }


  const isMatch = await bcrypt.compare(password, User.password);

  if (!isMatch) {
    return res.status(401).json({message:"Incorrect password"});
    // return false;
  }

   return res.status(200).json({ message: "Correct password" })
  //return true;
};
export const changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { password,newpassword, newconfirmPass } = req.body;
  const token = req.cookies.jwt;
  if (!token) {
    res.status(401).json({ message: "Unauthorised please login to change password " });
    return ;
    // return false;

  }
  let decodedUserId: string | undefined;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
    //console.log(decodedToken);
     decodedUserId = (decodedToken as jwt.JwtPayload).userId;
 console.log(decodedUserId);

  }
  catch (error) {
 res.status(401).json({ message: "Invalid or expired token. Please login again." });
 return ;
    // return false;
  }
  if (!decodedUserId) {
     res.status(401).json({ message: "Failed to extract user ID from token." });
     return ;
    // return false;
  }
  const User = await db.query.userTable.findFirst({ where: eq(userTable.userId, decodedUserId) }).execute()
  if (!User) {
    res.status(400).json({ message: "User not found." });
    return ;
    // return false;
  }


  const isMatch = await bcrypt.compare(password, User.password);

  if (!isMatch) {
     res.status(401).json({message:"Incorrect password"});
     return ;
    // return false;
  }
    if(password===newpassword){
        res.status(400).json({message:"New Password should not be same as old password"});
        return ;
      }
      //console.log(newpassword);
      //console.log(newconfirmPass);
      if(newconfirmPass!==newpassword){
        res.status(400).json({message:"new password and confirm password do not match"});
        return ;
      }
      if (!validator.isLength(newpassword, { min: 8 })) {
        res.status(400).json({message:"Password: Minimum 8 characters required"});
      }
      if (!validator.isStrongPassword(newpassword)) {
        res.status(400).json({message:"Password is not strong"});
      }
      
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newpassword, salt);

  await db.update(userTable)
    .set({ password: hashedPassword })
    .where(eq(userTable.userId, decodedUserId))
    .execute();
    res.status(200).json({ message: "Password successfully changed" });
    return ;
});
// const isPasswordCorrect:Response=async(password:string,token:string)=>{
//         try {
          
//         } catch (error) {
          
//         }
//}

// export const changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
//   const { password, confirmPass } = req.body;
//   try {

//     const token = req.cookies('jwt');
//     const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
//     const email = (decodedToken as JwtPayload).email;
//     const userId=(decodedToken as JwtPayload).userID;
//     const otp=createAndSend(userId);
//     const mailText=""
//     const mailSubject=""
//     const info = await  sendMail(email,mailSubject,mailText); 
//     res.status(200).json({ message: 'Email sent', info });


//   } catch (error) {

//   }
// });
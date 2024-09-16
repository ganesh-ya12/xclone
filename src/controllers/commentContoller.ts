import { db } from "../config/db";
import { drizzle } from "drizzle-orm/postgres-js";
import { commentTable } from "../models/userTable";
import { NextFunction, Request,Response } from "express";
import asyncHandler from "express-async-handler";


export const createComment=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {userId,postId,content}=req.body;
    const comment=await db.insert(commentTable).values({
        userId:userId,
        postId:postId,
        content:content
    }).returning({userId:commentTable.userId,content:commentTable.content}).execute();
    if (comment.length>0){
        res.status(200).json(comment);
        }
        else{
            res.status(404).json({message:"Unable to add the comment "})
        }
})
// export const allComments=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>
// {
//     const comments=await db.query.commentTable.findMany({})
// })
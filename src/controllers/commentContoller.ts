import { db } from "../config/db";
import { drizzle } from "drizzle-orm/postgres-js";
import { commentTable } from "../models/userTable";
import { NextFunction, Request,Response } from "express";
import asyncHandler from "express-async-handler";
import { eq } from "drizzle-orm";
import jwt  from "jsonwebtoken";


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
export const editComment=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {commentId,postId,content}=req.body;
    const token=req.cookies('access_token');
    const comment= await db.query.commentTable.findFirst({where:eq(commentTable.commentId,commentId)}).execute();
    const decodedToken=jwt.verify(token,process.env.JWT_SECRET as string);
    
    if(!comment){
        res.status(400).json({message:"There is no comment"});
        return ;
    }
   

    await db.update(commentTable).set({content}).where(eq(commentTable.commentId,commentId));
    res.status(200).json({message:"comment has been edited successfully"});
     return ;


});
export const deleteComment=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
   const {commentId}=req.body;
   const comment=await db.query.commentTable.findFirst({where:eq(commentTable.commentId,commentId)});
   if(!comment){
    res.status(400).json({message:"The comment is not avialable"});
    return ;
   }
   const isDeleted=await db.delete(commentTable).where(eq(commentTable.commentId,commentId)).returning();
   if (isDeleted.length > 0) {
    res.status(200).json({ success: true, message: "User marked as deleted successfully", commentId:isDeleted[0].commentId });
  } else {
    res.status(400).json({ success: false, message: "User not found or could not be marked as deleted" });
    return ;
  }
})
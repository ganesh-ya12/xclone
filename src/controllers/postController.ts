import { drizzle } from "drizzle-orm/postgres-js";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { userTable ,postTable,commentTable} from "../models/userTable";
import { eq } from "drizzle-orm";
import { Request,Response } from "express";
import { db } from "../config/db";
import { title } from "process";
import  jwt  from "jsonwebtoken";


export const createPost  =asyncHandler(async  (req:Request,res:Response,next:NextFunction)=>
{
    const {userId,title,content}=req.body;
    const users=await db.insert(postTable).values({
                   userId,
                   title,
                   content,
    })
    res.status(201).json({message:"pos created successfully"})

})
export const editPost=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {postId,title,content}=req.body;
    const token=req.cookies.jwt;
    const post=await db.query.postTable.findFirst(
        {where:eq(postTable.postId,postId)}
    );
    const decodedToken:any=jwt.verify(token,process.env.JWT_SECRET as string )
    const userId=decodedToken.userId;
    if(!post){
       res.status(404).json({message:"post doesn`t exists"});
       return  ;
    }
    if(userId!==post.userId){
        res.status(404).json({message:"you are not allowed to edit this post"});
        return ;
    }
      await db.update(postTable).set({title,content}).where(eq(postTable.postId,postId))
      res.status(200).json({message:"psot has been editied successfully"});
     return ;

    
})
export const userPosts =asyncHandler(async(req:Request,res:Response,next:NextFunction)=>
{
    const {userId}=req.body;
    const posts=await db.query.postTable.findMany({
        where: eq(postTable.userId,userId),
        with:{
            comments:true
        }
    })
    res.status(200).json(posts);
})
export const postsAll=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>
{
    const posts=await db.query.postTable.findMany({
        with:{
            comments:true
        }
    })
    if (posts.length>0){
    res.status(200).json(posts);
    }
    else{
        res.status(404).json({message:"Unable to find the posts "})
    }
});
export const deletePost=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {postId}=req.body;
    const post=await db.query.postTable.findFirst({where:eq(postTable.postId,postId)});
    if(!post){
     res.status(400).json({message:"The post is not avialable"});
     return ;
    }
    const isDeleted=await db.delete(postTable).where(eq(postTable.postId,postId)).returning();
    if (isDeleted.length > 0) {
     res.status(200).json({ success: true, message: "post is  deleted successfully", postId:isDeleted[0].postId });
     
   } else {
     res.status(400).json({ success: false, message: "post not found or could not be marked as deleted" });
     return ;
   }
 })


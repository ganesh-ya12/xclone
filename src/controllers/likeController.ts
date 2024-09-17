import { db } from "../config/db";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import { commentLikeTable, postLikeTable } from "../models/userTable";
import { eq, and } from "drizzle-orm";

// Like a post
export const likePost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.userId;
    const postId = parseInt(req.params.id, 10);
    
    try {
        const like = await db.insert(postLikeTable).values({ userId, postId });
        res.status(201).json({ message: "Post liked successfully", data: like });
    } catch (error) {
        next(error);
    }
});

// Dislike a post
export const disLikePost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.userId;
    const postId = parseInt(req.params.id, 10);
    
    try {
        const like = await db.delete(postLikeTable).where(and(
            eq(postLikeTable.postId, postId),
            eq(postLikeTable.userId, userId)
        ));
        res.status(201).json({ message: "Post disliked successfully", data: like });
    } catch (error) {
        next(error);
    }
});

// Like a comment
export const likeComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.userId;
    const commentId = parseInt(req.params.id, 10);
    
    try {
        // Use "commentId" as defined in the table
        const like = await db.insert(commentLikeTable).values({ userId, commentId });
        res.status(201).json({ message: "Comment liked successfully", data: like });
    } catch (error) {
        next(error);
    }
});

// Dislike a comment
export const disLikeComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.userId;
    const commentId = parseInt(req.params.id, 10);
    
    try {
        // Use "commentId" in the where clause
        const like = await db.delete(commentLikeTable).where(and(
            eq(commentLikeTable.commentId, commentId),
            eq(commentLikeTable.userId, userId)
        ));
        res.status(201).json({ message: "Comment disliked successfully", data: like });
    } catch (error) {
        next(error);
    }
});
import { Router } from "express";
import { createPost, editPost, postsAll, userPosts } from "../controllers/postController";
import { protect } from "../middleware/authmiddleware";
const router=Router();
router.post('/create',protect,createPost);
router.post('/find',userPosts);
router.post('/edit',protect,editPost);
router.get('/posts',postsAll);
export default router;
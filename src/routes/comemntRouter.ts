import { protect } from "../middleware/authmiddleware";
import { createComment, deleteComment, editComment } from "../controllers/commentContoller";
import { Router } from "express";
const router=Router();
router.post('/make',protect,createComment);
router.put('/edit',protect,editComment);
router.delete('/delete',protect,deleteComment)
export default router;

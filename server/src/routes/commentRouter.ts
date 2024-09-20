import { protect } from "../middleware/authmiddleware";
import { createComment, deleteComment, editComment } from "../controllers/commentContoller";
import { likeComment ,disLikeComment} from "../controllers/likeController";
import { Router } from "express";
const router=Router();
router.post('/make',protect,createComment);
router.put('/edit',protect,editComment);
router.delete('/delete',protect,deleteComment)
router.post('/:id/like',protect,likeComment);
router.delete('/:id/dislike',protect,disLikeComment);
export default router;

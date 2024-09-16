import { protect } from "../middleware/authmiddleware";
import { createComment } from "../controllers/commentContoller";
import { Router } from "express";
const router=Router();
router.post('/make',protect,createComment)
export default router;

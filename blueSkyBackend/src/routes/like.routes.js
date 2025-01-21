import { Router } from "express";
import verifyJwtToken from "../middlewares/auth.middlewares.js";
import { togglePostLike, userLikedPosts } from "../controllers/like.controllers.js";

const router = Router()

router.route('/:postId').post(verifyJwtToken, togglePostLike)
router.route('/:userId').get(userLikedPosts)

export default router

import { Router } from "express";
import verifyJwtToken from "../middlewares/auth.middlewares.js";
import { togglePostLike } from "../controllers/like.controllers.js";

const router = Router()

router.route('/:postId').post(verifyJwtToken, togglePostLike)

export default router

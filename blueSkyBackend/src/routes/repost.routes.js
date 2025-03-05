import { Router } from "express";
import verifyJwtToken from "../middlewares/auth.middlewares.js";
import { toggleRepost } from "../controllers/repost.contollers.js";

const router = Router()


router.route('/:postId').post(verifyJwtToken, toggleRepost)

export default router

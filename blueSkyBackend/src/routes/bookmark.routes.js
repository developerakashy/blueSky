import { Router } from "express";
import verifyJwtToken from "../middlewares/auth.middlewares.js";
import { getUserBookmark, toggleBookmark } from "../controllers/bookmark.controllers.js";

const router = Router()

router.route('/:postId').post(verifyJwtToken, toggleBookmark)
router.route('/').get(verifyJwtToken, getUserBookmark)

export default router

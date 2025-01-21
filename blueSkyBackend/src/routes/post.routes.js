import { Router } from "express";
import verifyJwtToken from "../middlewares/auth.middlewares.js";
import { deletePost, getAllPosts, getPostById, publishPost, updatePost } from "../controllers/post.contollers.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router()

router.route('/:postId').get(verifyJwtToken, getPostById)
router.route('/').get(verifyJwtToken, getAllPosts)

//secured route
router.route('/publish').post(verifyJwtToken, upload.fields([{name: 'mediaFiles', maxCount: 4}]), publishPost)
router.route('/:postId').patch(verifyJwtToken, upload.fields([{name: 'mediaFiles', maxCount: 4}]), updatePost)
router.route('/:postId').delete(verifyJwtToken, deletePost)

export default router

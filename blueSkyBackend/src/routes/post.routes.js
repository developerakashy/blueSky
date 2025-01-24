import { Router } from "express";
import verifyJwtToken from "../middlewares/auth.middlewares.js";
import { deletePost, getAllPosts, getPostById, getUserLikedPosts, getUserPosts, getUserReplies, publishPost, updatePost } from "../controllers/post.contollers.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router()

router.route('/:postId').get(verifyJwtToken, getPostById)
router.route('/').get(verifyJwtToken, getAllPosts)
router.route('/:username/posts').get(verifyJwtToken, getUserPosts)
router.route('/:username/replies').get(verifyJwtToken, getUserReplies)
router.route('/:username/liked').get(verifyJwtToken, getUserLikedPosts)

//secured route
router.route('/publish').post(verifyJwtToken, upload.fields([{name: 'mediaFiles', maxCount: 4}]), publishPost)
router.route('/:postId').patch(verifyJwtToken, upload.fields([{name: 'mediaFiles', maxCount: 4}]), updatePost)
router.route('/:postId').delete(verifyJwtToken, deletePost)

export default router

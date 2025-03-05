import { Router } from "express";
import verifyJwtToken from "../middlewares/auth.middlewares.js";
import { deletePost, getAllPosts, getFollowingPosts, getPostById, getQueriedPost, getUserPosts, mostRepostedPost, publishPost, updatePost } from "../controllers/post.contollers.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router()

router.route('/most_reposted').get(verifyJwtToken, mostRepostedPost)
router.route('/search').get(verifyJwtToken, getQueriedPost)
router.route('/all').get(verifyJwtToken, getAllPosts)
router.route('/following').get(verifyJwtToken, getFollowingPosts)
router.route('/:postId').get(verifyJwtToken, getPostById)
router.route('/:username/posts').get(verifyJwtToken, getUserPosts)

//secured route
router.route('/publish').post(verifyJwtToken, upload.fields([{name: 'mediaFiles', maxCount: 4}]), publishPost)
router.route('/:postId').patch(verifyJwtToken, upload.fields([{name: 'mediaFiles', maxCount: 4}]), updatePost)
router.route('/:postId').delete(verifyJwtToken, deletePost)

export default router

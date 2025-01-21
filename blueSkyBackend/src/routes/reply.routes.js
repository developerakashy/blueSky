import { Router } from "express";
import verifyJwtToken from "../middlewares/auth.middlewares.js";
import { deletePost, publishPost, updatePost } from "../controllers/post.contollers.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router()

//secured Route
router.route('/publish').post(verifyJwtToken, upload.fields([{name: "mediaFiles", maxCount: 4}]), publishPost)

export default router

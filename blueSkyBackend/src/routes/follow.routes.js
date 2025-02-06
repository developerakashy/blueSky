import { Router } from "express";
import { toggleFollow, userFollowers, userFollowings } from "../controllers/follow.controllers.js";
import verifyJwtToken from "../middlewares/auth.middlewares.js";

const router = Router()

router.route('/followers/:userId').get(verifyJwtToken, userFollowers)
router.route('/followings/:userId').get(verifyJwtToken, userFollowings)
//secured route
router.route('/:userId').post(verifyJwtToken ,toggleFollow)

export default router

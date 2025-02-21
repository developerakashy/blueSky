import { Router } from "express";
import { mostFollowedUsers, toggleFollow, userFollowers, userFollowings } from "../controllers/follow.controllers.js";
import verifyJwtToken from "../middlewares/auth.middlewares.js";

const router = Router()

router.route('/most-followed').get(mostFollowedUsers)

//secured route
router.route('/followers/:userId').get(verifyJwtToken, userFollowers)
router.route('/followings/:userId').get(verifyJwtToken, userFollowings)
router.route('/:userId').post(verifyJwtToken ,toggleFollow)


export default router

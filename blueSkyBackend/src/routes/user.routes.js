import { Router } from "express";
import { getLoggedInUser, isUsernameAvailable, login, logout, register, updateProfile, userProfile  } from "../controllers/user.contollers.js";
import verifyJwtToken from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router()

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/username').get(isUsernameAvailable)

//secured routes
router.route('/loggedin').get(verifyJwtToken, getLoggedInUser)
router.route('/:username').get(verifyJwtToken, userProfile)
router.route('/update-profile').post(verifyJwtToken, upload.fields([
    {
        name: 'avatarImage',
        maxCount: 1
    },
    {
        name: 'coverImage',
        maxCount: 1
    }
]),  updateProfile)
router.route('/logout').post(verifyJwtToken, logout)

export default router

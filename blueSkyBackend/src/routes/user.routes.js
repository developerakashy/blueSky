import { Router } from "express";
import { getLoggedInUser, isUserAvailable, login, logout, register, updateProfile, getUserProfile, notifications, sendUserVerificationEmail, verifyUserVerificationToken, getUsers  } from "../controllers/user.contollers.js";
import verifyJwtToken from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router()

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/exist').post(isUserAvailable)
router.route('/all').get(getUsers)

//secured routes
router.route('/loggedin').get(verifyJwtToken, getLoggedInUser)
router.route('/notifications').get(verifyJwtToken, notifications)
router.route('/:username').get(verifyJwtToken, getUserProfile)
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
router.route('/send-verification-email').post(verifyJwtToken, sendUserVerificationEmail)
router.route('/verify-token').post(verifyJwtToken, verifyUserVerificationToken)

export default router

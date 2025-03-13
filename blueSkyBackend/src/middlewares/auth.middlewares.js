import { options } from "../constants.js";
import { generateAccessAndRefreshToken } from "../controllers/user.contollers.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncRequestHandler.js";
import jwt from 'jsonwebtoken'


const isPublicRoute = (req) => {
    return (
        (req?.baseUrl === '/post') &&
            req?.method === 'GET'
    )
}

const verifyJwtToken = asyncHandler(async (req, res, next) => {

    const incomingAccessToken = req?.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    const incomingRefreshToken = req?.cookies?.refreshToken

    if(!incomingAccessToken?.trim()){
        if(isPublicRoute(req)) return next()


        throw new ApiError(400, 'user not loggedIn')
    }

    let accessTokenError = ''

    try {
        const decodeToken = jwt.verify(incomingAccessToken, process.env.JWT_SECRET)

        const user = await User.findById(decodeToken._id).select('-password -refreshToken')

        if(!user) throw new ApiError(400, 'token mismatch')

        req.user = user

        return next()

    } catch (error) {
        if(!(error?.name === 'TokenExpiredError')) throw new ApiError(400, 'token invalid', error)

        accessTokenError = error
    }

    try {

        if(!incomingRefreshToken?.trim()){
            throw new ApiError(400, accessTokenError?.message || 'Access Token Expired', accessTokenError)
        }

        const decodeToken = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET)

        const user = await User.findById(decodeToken._id).select("-password")

        if(user?.refreshToken !== incomingRefreshToken){
            throw new ApiError(400, 'Token used')
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        const decodeNewToken = jwt.verify(newAccessToken, process.env.JWT_SECRET)

        const loggedInUser = await User.findById(decodeNewToken._id).select("-password -refreshToken")

        req.user = loggedInUser

        res.cookie('accessToken', newAccessToken, options)
        res.cookie('refreshToken', newRefreshToken, options)

        next()

    } catch (error) {
        if(error?.name === 'TokenExpiredError') res.clearCookie('accessToken', options).clearCookie('refreshToken', options)

        throw new ApiError(400, error?.message || 'something went wrong', error)
    }

})

export default verifyJwtToken

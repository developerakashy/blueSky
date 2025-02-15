import { asyncHandler } from "../utils/asyncRequestHandler.js"
import { ApiResponse } from '../utils/ApiResponse.js'
import { User } from "../models/user.models.js"
import { ApiError } from '../utils/ApiError.js'
import { options } from "../constants.js"
import { destroyOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import fs from 'fs'
import { Post } from "../models/post.models.js"
import mongoose from "mongoose"
import { Notification, NotificationType } from "../models/notification.models.js"
import { postDetail } from "./post.contollers.js"
import { sendEmail } from "../utils/mail.js"
import { Bookmark } from "../models/bookmark.models.js"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        if(!user) throw new ApiError(400, 'user not found')

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(400, error?.message || 'error generating access token and refresh token')
    }
}

const register = asyncHandler(async (req, res) => {
    const {username, email, fullname, password} = req.body

    if(
        [username, email, fullname, password].some((str) => str?.trim() === '') ||
        !username || !email || !password || !fullname
    ){
        throw new ApiError(400, 'All fields are mandatory')
    }

    try {
        const userExist = await User.findOne({email})

        if(userExist) throw new ApiError(200, {userExist: true})

        const user = await User.create({
            fullname,
            email,
            username,
            password
        })

        if(!user) throw new ApiError(400, 'something went wrong while registring user')

        await Bookmark.create({
            userId: user?._id
        })

        return res.status(200).json(new ApiResponse(200, user, 'user creation successfull'))

    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong')
    }


})

const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    if(!username || !password || !username?.trim() || !password?.trim()){
        throw new ApiError(400, 'All fields are mandatory')
    }

    try {
        const user = await User.findOne({username})

        if(!user) throw new ApiError(400, 'username does not exist')

        const matchPassword = await user.isPasswordCorrect(password)

        if(!matchPassword) throw new ApiError(400, 'wrong password')

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        const loggedInUser = await User.findById(user._id).select('-password -refreshToken')

        if(!loggedInUser) throw new ApiError(400, 'user not found')

        return res
                .status(200)
                .cookie('accessToken', accessToken, options)
                .cookie('refreshToken', refreshToken, options)
                .json(new ApiResponse(200, loggedInUser, 'user loggedIn successfully'))

    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong')
    }
})

const getLoggedInUser = asyncHandler(async (req, res) => {

    try {

        return res.status(200).json(new ApiResponse(200, req?.user, 'User Fetched Successfully'))

    } catch (error) {

        throw new ApiError(400, error?.message || 'something went wrong')
    }

})

const isUserAvailable = asyncHandler(async (req, res) => {
    const { username, email } = req?.body

    if(!username?.trim() && !email?.trim()) throw new ApiError(400, 'username or email field is mandatory')

    try {
        if(username){
            const user = await User.findOne({username})

            if(!user?.username) return res.status(200).json(new ApiResponse(200, {available: true}, 'username available'))

            return res.status(200).json(new ApiResponse(200, {available: false}, 'username unavailable'))
        }

        if(email){
            const user = await User.findOne({email})

            if(!user?.email) return res.status(200).json(new ApiResponse(200, {exist: false}, 'email address does not exist'))

            return res.status(200).json(new ApiResponse(200, {exist: true}, 'email address exist'))
        }

    } catch (error) {
        throw new ApiError(400, error?.message || 'something went while getting username')
    }
})

const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req?.params

    const currentUser = req?.user?._id ? new mongoose.Types.ObjectId(req.user._id) : ''

    try {
        const userInfo = await User.aggregate([
            {
                $match: {
                    username
                }
            },
            {
                $lookup: {
                    from: 'follows',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'followers'
                }
            },
            {
                $addFields: {
                    userFollowed: {
                        $in : [currentUser, {$ifNull: [{$first: '$followers.userIdArray'}, []]}]
                    },
                    followerCount: {
                        $size: {
                            $ifNull: [{$first: '$followers.userIdArray'}, []]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'follows',
                    localField: '_id',
                    foreignField: 'userIdArray',
                    as: 'followings'
                }
            },
            {
                $addFields: {
                    followingCount: {
                        $size: {
                            $ifNull: ['$followings', []]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    email: 1,
                    fullname: 1,
                    coverImage: 1,
                    avatar: 1,
                    about: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    isVerified: 1,
                    userFollowed: 1,
                    followerCount: 1,
                    followingCount: 1
                }
            }

        ])

        if(!userInfo) throw new ApiError(400, 'user not found')


        return res.status(200).json(new ApiResponse(200, userInfo[0], 'user fetched successfully'))
    } catch (error) {
        throw new ApiError(400, error?.message || 'someething went wrong')
    }
})


const updateProfile = asyncHandler(async (req, res) => {
    const { about, fullname } = req.body
    const avatarImagePath = req.files?.avatarImage?.[0]?.path
    const coverImagePath = req.files?.coverImage?.[0]?.path

    const updates = {}

    if(about) updates.about = about
    if(fullname?.trim()) updates.fullname = fullname

    let avatarImage
    if(avatarImagePath && req.files?.avatarImage?.[0]?.mimetype?.split('/')[0] === 'image'){

        try {
            const res = await uploadOnCloudinary(avatarImagePath)
            avatarImage = res
        } catch (error) {
            console.log(error)
            throw new ApiError(400, 'error uploading avatar image')
        }
    }

    let coverImage
    if(coverImagePath && req.files?.coverImage?.[0]?.mimetype?.split('/')[0] === 'image'){
        try {
            const res = await uploadOnCloudinary(coverImagePath)
            coverImage = res

        } catch (error) {
            throw new ApiError(400, 'error uploading coverImage file')
        }
    }


    if(avatarImage) updates.avatar = avatarImage.url
    if(coverImage) updates.coverImage = coverImage.url

    if(Object.keys(updates).length === 0) throw new ApiError(400, 'No fields provided for profile update')

    try {
        const updateProfile = await User.findByIdAndUpdate(req.user._id, {
            $set: updates
        })

        if(!updateProfile) throw new ApiError(400, 'profile update unsuccessfull')

        const updatedProfile = await User.findById(updateProfile._id).select("-password -refreshToken")

        if(avatarImage){

            const avatarImageUrl = req?.user?.avatar?.split('/')
            const public_id = avatarImageUrl[avatarImageUrl.length - 1].split('.')[0]

            if(public_id && !(public_id === 'xoghtvakela7cvwnaj4w')){
                const res = await destroyOnCloudinary(public_id)
                console.log('prev avatar deleted', res)
            }

        }

        if(coverImage){

            const coverImageUrl = req?.user?.coverImage?.split('/')
            const public_id = coverImageUrl[coverImageUrl.length - 1].split('.')[0]

            if(public_id && !(public_id === 'gnakonztwpppjgkr6ved')){
                const res = await destroyOnCloudinary(public_id)
                console.log('prev cover image deleted', res)
            }

        }

        return res.status(200).json(new ApiResponse(200, updatedProfile, 'Profile updation successfull'))

    } catch (error) {
        fs.unlinkSync(avatarImagePath)
        fs.unlinkSync(coverImagePath)

        if(avatarImage){
            await destroyOnCloudinary(avatarImage.public_id)
        }

        if(coverImage){
            await destroyOnCloudinary(coverImage.public_id)
        }
        throw new ApiError(400, 'something went wrong and images deleted')
    }

})

const logout = asyncHandler(async (req, res) => {

    try {
        const user = await User.findById(req.user._id)

        if(!user) throw new ApiError(400, 'user not loggedIn')

        return res
                .clearCookie('accessToken', options)
                .clearCookie('refreshToken', options)
                .json(new ApiResponse(200, user, 'User Logged Out'))

    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong')
    }

})

const sendUserVerificationEmail = asyncHandler(async (req, res) => {

    try {
        const codeExpiration = await sendEmail(req?.user?.email, 'VERIFY', req?.user?._id)

        return res.status(200).json(new ApiResponse(200, {codeExpiration}, 'mail sent successfully'))

    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong while sending verification mail')
    }
})

const verifyUserVerificationToken = asyncHandler(async (req, res) => {
    const { verificationCode } = req.body

    try {
        const user = await User.findOne({
            _id: req?.user?._id,
            verificationCode: parseInt(verificationCode)
        })

        if(!user) throw new ApiError(400, 'Incorrect code')

        if(user?.verificationCodeExpiry < Date.now()) throw new ApiError(400, 'Verification code expired')


        user.isVerified = true
        user.verificationCode = null
        user.verificationCodeExpiry = null

        await user.save()

        const userVerified = await User.findById(user?._id).select('-password -refreshToken')

        return res.status(200).json(new ApiResponse(200, userVerified, 'verification successfull'))
    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong while verifying user')
    }
})

const notifications = asyncHandler(async (req, res) => {

    try {
        const notifications = await Notification.find({
            receiverUserId: req?.user?._id
        }).populate('receiverUserId', 'fullname avatar username').sort({createdAt: -1})

        const processedNotification = await Promise.all(
            notifications.map(async (notification) => {

                const currentUser = req?.user?._id ? new mongoose.Types.ObjectId(req.user._id) : ''
                if(notification.type === NotificationType.REPLY){
                    const postReplyId = await postDetail(notification?.postReplyId, currentUser)

                    return {
                        ...notification._doc,
                        postReplyId
                    }

                } else if(notification.type === NotificationType.MENTION){
                    const relatedPostId = await postDetail(notification?.relatedPostId, currentUser)

                    return {
                        ...notification?._doc,
                        relatedPostId
                    }

                } else {
                    const senderUserId = await User.findById(notification.senderUserId).select('-password -refreshToken')
                    const relatedPostId = await Post.findById(notification.relatedPostId)

                    return {
                        ...notification._doc,
                        senderUserId,
                        relatedPostId
                    }
                }
            })
        )


        return res.status(200).json(new ApiResponse(200, processedNotification, 'notifications fetched'))

    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong while getting notifications')
    }
})

const getUsers = asyncHandler(async (req, res) => {
    const { search: searchQuery } = req.query

    console.log(searchQuery)
    try {
        const users = await User.aggregate([
            {
                $match: {
                    username: { $regex: searchQuery, $options: "i" }
                }
            },
            {
                $project: { fullname: 1, username: 1, avatar: 1 }
            },
            {
                $sort: { username: 1 }
            },
            {
                $limit: 10
            }
        ]);

        // const users = await User.find({_id:{$ne: null}}).select("-password -refreshToken")

        return res.status(200).json(new ApiResponse(200, users, 'users fetched successfully'))

    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong while getting users')
    }
})


export {
    generateAccessAndRefreshToken,
    register,
    login,
    getLoggedInUser,
    isUserAvailable,
    updateProfile,
    logout,
    getUserProfile,
    notifications,
    sendUserVerificationEmail,
    verifyUserVerificationToken,
    getUsers
}

import mongoose from "mongoose";
import { Follow } from "../models/follow.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncRequestHandler.js";

const toggleFollow = asyncHandler(async (req, res) => {
    const { userId } = req.params

    try {
        if(req.user._id.toString() === userId) throw new ApiError(400, 'You cannot follow yourself')

        const follow = await Follow.findOne({userId})

        if(!follow) throw ApiError(400, `user's Follow model cannot be found`)

        const userFollowed = follow?.userIdArray.indexOf(req.user._id) === -1 ? false: true

        if(!userFollowed){
            await Follow.updateOne(
                {userId},
                {
                    $addToSet: {
                        userIdArray: req.user._id
                    }
                }
            )
        } else {
            await Follow.updateOne(
                {userId},
                {
                    $pull: {
                        userIdArray: req.user._id
                    }
                }
            )
        }

        const userFollowers = await Follow.findOne({userId})

        return res.status(200).json(new ApiResponse(200, userFollowers, 'follow toggled success'))


    } catch (error) {
        throw new ApiError(400, error?.message || 'something went while toggling follow')
    }
})

const userFollowers = asyncHandler(async (req, res) => {
    const { userId } = req.params

    try {
        const userFollowersInfo =  await followers(userId)

        return res.status(200).json(new ApiResponse(200, userFollowersInfo, 'ok'))
    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong')
    }
})

const userFollowings = asyncHandler(async (req, res) => {
    const { userId } = req.params

    try {
        const userFollowersInfo =  await followings(userId)

        return res.status(200).json(new ApiResponse(200, userFollowersInfo, 'ok'))
    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong')
    }
})


const followers = async (userId) => {
    const result = await Follow.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $unwind: '$userIdArray'
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userIdArray',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        {
            $unwind: '$userInfo'
        },
        {
            $project: {
                _id: '$userInfo._id',
                fullname: '$userInfo.fullname',
                username: '$userInfo.username',
                email: '$userInfo.email',
                avatar: '$userInfo.avatar',
                coverImage: '$userInfo.coverImage',
                isVerified: '$userInfo.isVerified',
                createdAt: '$userInfo.createdAt',
                updatedAt: '$userInfo.updatedAt',

            }
        }
    ])

    return result
}

const followings = async (userId) => {
    const result = await Follow.aggregate([
        {
            $match: {
                userIdArray: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        {
            $project: {
                _id: {$first: '$userInfo._id'},
                fullname: {$first: '$userInfo.fullname'},
                username: {$first: '$userInfo.username'},
                email: {$first: '$userInfo.email'},
                avatar: {$first: '$userInfo.avatar'},
                coverImage: {$first: '$userInfo.coverImage'},
                isVerified: {$first: '$userInfo.isVerified'},
                createdAt: {$first: '$userInfo.createdAt'},
                updatedAt: {$first: '$userInfo.updatedAt'},
            }
        }
    ])

    return result
}

export {
    toggleFollow,
    userFollowers,
    userFollowings
}

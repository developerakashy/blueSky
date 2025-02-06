import mongoose from "mongoose";
import { Follow } from "../models/follow.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncRequestHandler.js";
import { Notification, NotificationType } from "../models/notification.models.js";
import { io } from "../app.js";
import { User } from "../models/user.models.js";

const toggleFollow = asyncHandler(async (req, res) => {
    const { userId } = req.params

    try {
        if(req.user._id.toString() === userId) throw new ApiError(400, 'You cannot follow yourself')

        const follow = await Follow.findOne({userId})

        if(!follow) throw ApiError(400, `user's Follow model cannot be found`)

        const receiverUser = await User.findById(userId)

        const notificationExist = await Notification.findOne({
            senderUserId: req?.user?._id,
            receiverUserId: receiverUser?._id,
            type: {$in: [NotificationType.FOLLOW, NotificationType.UNFOLLOW]}
        })

        const userFollowed = follow?.userIdArray.indexOf(req.user._id) === -1 ? false: true

        if(!userFollowed){
            await Follow.updateOne(
                {userId},
                {
                    $push: {
                        userIdArray: req.user._id
                    }
                }
            )

            if(!notificationExist){
                const notificationCreated = await Notification.create({
                    senderUserId: req?.user?._id,
                    receiverUserId: receiverUser?._id,
                    type: NotificationType.FOLLOW,
                    message: 'Followed you'
                })

                if(!notificationCreated) throw new ApiError(400, 'error creating notification')

                io.to(receiverUser?._id?.toString()).emit('newNotification', {
                    _id: notificationCreated?._id,
                    senderUserId: req?.user,
                    receiverUserId: receiverUser,
                    type: NotificationType.FOLLOW,
                    message: notificationCreated.message
                })
            } else {
                await Notification.findByIdAndUpdate(notificationExist?._id,
                    {
                        $set:{
                            type: NotificationType.FOLLOW
                        }
                    }
                )
            }

        } else {
            await Follow.updateOne(
                {userId},
                {
                    $pull: {
                        userIdArray: req.user._id
                    }
                }
            )

            if(notificationExist){
                await Notification.findByIdAndUpdate(notificationExist?._id,
                    {
                        $set:{
                            type: NotificationType.UNFOLLOW
                        }
                    }
                )
            }
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
        const currentUser = req?.user?._id ? new mongoose.Types.ObjectId(req?.user?._id) : ''
        const userFollowersInfo =  await followers(userId, currentUser)

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


const followers = async (userId, currentUser) => {
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
            $lookup: {
                from: 'follows',
                localField: 'userIdArray',
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
            $unwind: '$userInfo'
        },
        {
            $project: {
                _id: '$userInfo._id',
                fullname: '$userInfo.fullname',
                username: '$userInfo.username',
                email: '$userInfo.email',
                avatar: '$userInfo.avatar',
                about: '$userInfo.about',
                coverImage: '$userInfo.coverImage',
                isVerified: '$userInfo.isVerified',
                createdAt: '$userInfo.createdAt',
                updatedAt: '$userInfo.updatedAt',
                userFollowed: 1,
                followerCount: 1

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
                about: {$first: '$userInfo.about'},
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

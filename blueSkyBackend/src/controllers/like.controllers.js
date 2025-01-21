import mongoose from "mongoose";
import { Like} from "../models/like.models.js";
import { Post } from "../models/post.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncRequestHandler.js";

const togglePostLike = asyncHandler(async (req, res) => {
    const { postId } = req.params

    try {
        const like = await Like.findOne({postId})

        if(!like) throw new ApiError(400, 'Like not found')

        const userLiked = like?.userIdArray.indexOf(req.user._id) === -1 ? false : true


        if(!userLiked){

            await Like.updateOne(
                {postId},
                {
                    $push: {
                        userIdArray: req.user._id
                    }
                }
            )
        } else {

            await Like.updateOne(
                {postId},
                {
                    $pull: {
                        userIdArray: req.user._id
                    }
                }
            )
        }

        const likeToggled = await Like.findOne({postId})

        return res.status(200).json(new ApiResponse(200, likeToggled, 'Like toggled'))

    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong')
    }
})

const userLikedPosts = asyncHandler(async (req, res) => {
    const { userId } = req.params

    try {
        const userLiked = await postsLiked(userId)

        return res.status(200).json(new ApiResponse(200, userLiked, 'done'))
    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong')
    }
})

const postsLiked = async (userId) => {
    const result = await Like.aggregate([
        {
            $match: {
                userIdArray: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: 'posts',
                localField: 'postId',
                foreignField: '_id',
                as: 'postsLiked'
            }
        },
        {
            $project: {
                postsLiked: 1
            }
        },
        {
            $unwind: '$postsLiked'
        },
        {
            $lookup: {
                from: 'posts',
                localField: 'postsLiked._id',
                foreignField: 'parentPost',
                as: 'replies'
            }
        },
        {
            $addFields: {
                replyCount: {
                    $size: '$replies'
                }
            }
        },
        {
            $lookup: {
                from: 'likes',
                localField: 'postsLiked._id',
                foreignField: 'postId',
                as: 'postLikes'
            }
        },
        {
            $addFields: {
                likeCount: {
                    $size: {$first: '$postLikes.userIdArray'}
                }
            }
        },
        {
            $group: {
                _id: '$postsLiked._id',
                text: {$first: '$postsLiked.text'},
                mediaFiles: {$first: '$postsLiked.mediaFiles'},
                userId: {$first: '$postsLiked.userId'},
                parentPost: {$first: '$postsLiked.parentPost'},
                isPublic: {$first: '$postsLiked.isPublic'},
                createdAt: {$first: '$postsLiked.createdAt'},
                updatedAt: {$first: '$postsLiked.updatedAt'},
                replyCount: {$first: '$replyCount'},
                likeCount: {$first: '$likeCount'},

            }
        }
    ])

    return result
}

export {
    togglePostLike,
    userLikedPosts
}

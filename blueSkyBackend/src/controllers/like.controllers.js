import mongoose from "mongoose";
import { Like} from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncRequestHandler.js";
import { Notification, NotificationType } from "../models/notification.models.js";
import { Post } from "../models/post.models.js";
import { User } from "../models/user.models.js";
import { io } from "../app.js";

const togglePostLike = asyncHandler(async (req, res) => {
    const { postId } = req.params

    try {
        const post = await Post.findById(postId)

        if(!post) throw new ApiError(400, 'post does not exist')

        const like = await Like.findOne({postId})

        if(!like) throw new ApiError(400, 'Like not found')

        const receiverUser = await User.findById(post?.userId)

        const notificationExist = await Notification.findOne({
            relatedPostId: post?._id,
            senderUserId: req?.user?._id
        })
        
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


            if(!notificationExist){

                const notificationCreated = await Notification.create({
                    senderUserId: req?.user?._id,
                    receiverUserId: receiverUser?._id,
                    type: NotificationType.LIKE,
                    message: 'Liked your post',
                    relatedPostId: post?._id
                })

                if(!notificationCreated) throw new ApiError(400, 'error creating notification')

                io.to(post?.userId?.toString()).emit('newNotification', {
                    senderUserId: req?.user,
                    receiverUserId: receiverUser,
                    type: NotificationType.LIKE,
                    message: 'Liked your post',
                    relatedPostId: post

                })
            } else {
                await Notification.findByIdAndUpdate(notificationExist?._id,
                    {
                        $set:{
                            type: NotificationType.LIKE
                        }
                    }
                )
            }


        } else {

            await Like.updateOne(
                {postId},
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
                            type: NotificationType.UNLIKE
                        }
                    }
                )
            }
        }

        const likeToggled = await Like.findOne({postId})

        return res.status(200).json(new ApiResponse(200, likeToggled, 'Like toggled'))

    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong')
    }
})


export {
    togglePostLike,
}

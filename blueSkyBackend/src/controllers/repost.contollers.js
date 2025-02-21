import { Post } from "../models/post.models.js"
import { Repost } from "../models/repost.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncRequestHandler.js"

const toggleRepost = asyncHandler(async (req, res) => {
    const { postId } = req.params

    try {
        const post = await Post.findById(postId)
        if(!post) throw new ApiError(400, 'Post does not exist')

        const repost = await Repost.findOne(
            {
                postId,
                userId: req?.user?._id
            }
        )


        if(!repost){

            await Repost.create({
                postId,
                userId: req?.user?._id
            })

            


        } else {

            await Repost.findByIdAndDelete(repost?._id)

        }

        const postRepost = await Repost.aggregate([
            {
                $match: {
                    postId: post?._id
                }
            },
            {
                $group: {
                    _id: "$postId",
                    repostCount: { $sum: 1 }
                }
            }
        ])

        return res.status(200).json(new ApiResponse(200, postRepost[0], 'Repost count'))

    } catch (error) {
        throw new ApiError(200, 'something went wrong while toggling repost')
    }
})

export {
    toggleRepost
}

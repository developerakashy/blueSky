import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncRequestHandler.js";
import fs from 'fs'
import { destroyOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/post.models.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.models.js";
import { User } from "../models/user.models.js";

const publishPost = asyncHandler(async (req, res) => {
    const { text, parentPostId } = req.body
    const { mediaFiles = [] } = req.files

    const publicIds = []
    const mediaFileUrls =  []
    const publish = {}

    if(text?.trim()) publish.text = text

    try {
        if(req?.baseUrl === '/reply'){
            const parentPost = await Post.findById(parentPostId)
            if(!parentPost) throw new ApiError(400, 'Parent post not found')

            publish.parentPost = parentPostId
        }

        if(
            mediaFiles.some(file => file.mimetype.split('/')[0] !== 'image' && file.mimetype.split('/')[0] !== 'video/mp4')
        ){
            throw new ApiError(400, 'Only images and videos allowed')
        }

        for(const file of mediaFiles){
            try {
                const response = await uploadOnCloudinary(file?.path)
                mediaFileUrls.push(response.url)
                publicIds.push(response.public_id)
            } catch (error) {
                throw new ApiError(400, `Error uploading: ${file}`)
            }

        }

        if(mediaFileUrls.length > 0) publish.mediaFiles = mediaFileUrls

        try {
            const post = await Post.create({
                userId: req.user._id,
                ...publish
            })

            if(!post) throw new ApiError(400, 'error publishing post')

            const postCreated = await Post.findById(post._id).populate({path: 'userId', select: '-password -refreshToken'})
            await Like.create({
                postId: post._id
            })

            return res.status(200).json(new ApiResponse(200, postCreated, 'Post published successfully'))
        } catch (error) {
            throw new ApiError(400, error?.message || 'something went wrong while publishing post')
        }


    } catch (error) {

        if(publicIds.length < 1){
            publicIds.forEach(async (id) => {
                await destroyOnCloudinary(id)
            })
        }

        for(const file of mediaFiles){
            fs.unlinkSync(file?.path)
        }

        throw new ApiError(400, error?.message || 'something went wrong while publishing post')
    }


})

const updatePost = asyncHandler(async (req, res) => {
    const { postId } = req.params
    const { text } = req.body
    const { mediaFiles = [] } = req?.files

    const publicIds = []
    const mediaFileUrls =  []
    const update = {}

    try {
        const post = await Post.findById(postId)

        if(!post) throw new ApiError(400, 'Post not found')

        if(text?.trim()) update.text = text

        if(
            mediaFiles.some(file => file.mimetype.split('/')[0] !== 'image' && file.mimetype.split('/')[0] !== 'video')
        ){
            throw new ApiError(400, 'Only images and videos allowed')
        }

        for(const file of mediaFiles){
            try {
                const response = await uploadOnCloudinary(file?.path)
                mediaFileUrls.push(response.url)
                publicIds.push(response.public_id)
            } catch (error) {
                throw new ApiError(400, `Error uploading: ${file}`)
            }

        }

        update.mediaFiles = mediaFileUrls

        try {
            const updatePost = await Post.findByIdAndUpdate(postId, {
                $set: update
            })

            if(!updatePost) throw new ApiError(400, 'error updating post')

            const updatedPost = await Post.findById(updatePost._id)

            for(const url of post.mediaFiles){
                const mediaUrl = url.split('/')
                const publicId = mediaUrl[mediaUrl.length - 1].split('.')[0]

                await destroyOnCloudinary(publicId)
            }

            return res.status(200).json(new ApiResponse(200, updatedPost, 'Post updation successfully'))

        } catch (error) {
            throw new ApiError(400, error?.message || 'something went wrong while updating post')
        }


    } catch (error) {

        if(publicIds.length < 1){
            publicIds.forEach(async (id) => {
                await destroyOnCloudinary(id)
            })
        }

        for(const file of mediaFiles){
            fs.unlinkSync(file?.path)
        }

        throw new ApiError(400, error?.message || 'something went wrong while publishing post')
    }
})

const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params

    try {
        const post = await Post.findById(postId)

        if(!post) throw new ApiError(400, 'Post not found')

        if(post.userId.toString() !== req.user._id.toString()){
            throw new ApiError(400, 'user unauthorized')
        }

        const postDeleted = await Post.findByIdAndDelete(postId)

        if(!postDeleted) throw new ApiError(400, 'Error deleting post')

        for(const url of post.mediaFiles){
            const mediaUrl = url.split('/')
            const publicId = mediaUrl[mediaUrl.length - 1].split('.')[0]

            await destroyOnCloudinary(publicId)
        }

        return res.status(200).json(new ApiResponse(200, postDeleted, 'Post deletion successfull'))
    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong while deleting post')
    }

})

const getPostById = asyncHandler(async (req, res) => {
    const { postId } = req.params
    const currentUser = req?.user?._id ? new mongoose.Types.ObjectId(req.user._id) : ''
    try {
        const post = await postDetail(postId, currentUser)

        if(!post) throw new ApiError(400, 'Post not found')

        const replies = await postReplies(postId, currentUser)

        const parentPost = await parentPostHierarchy(postId, currentUser)

        return res.status(200).json(new ApiResponse(200, { post, parentPost, replies }, 'Post fetched'))

    } catch (error) {
        throw new ApiError(400, error?.message || 'Post not found')
    }
})

const getAllPosts = asyncHandler(async (req, res) => {

    const currentUser = req?.user?._id ? new mongoose.Types.ObjectId(req.user._id) : ''

    try {
        const posts = await Post.aggregate([
            {
                $match: {
                    parentPost: null
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
                $addFields: {
                    userId: {
                        $first: '$userInfo'
                    }
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
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
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'postLikes'
                }
            },
            {
                $addFields: {
                    likeCount: {
                        $size: {
                            $ifNull: [{ $first: '$postLikes.userIdArray' }, []]
                        }
                    },
                    userLiked: {
                        $in: [currentUser, {$ifNull: [{ $first: '$postLikes.userIdArray' }, []]}]
                    }
                }
            },
            {
                $project: {
                    text: 1,
                    mediaFiles: 1,
                    userId: {
                        _id: 1,
                        fullname: 1,
                        username: 1,
                        email: 1,
                        avatar: 1,
                        coverImage: 1,
                        about: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        isVerified: 1
                    },
                    parentPost: 1,
                    isPublic: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    replyCount: 1,
                    likeCount: 1,
                    userLiked: 1

                }
            }
        ])


        return res.status(200).json(new ApiResponse(200, posts, 'posts fetched successfully'))
    } catch (error) {
        throw new ApiError(400, error?.message || 'somrhting went wrong')
    }
})



const postDetail = async (postId, currentUser) => {
    const result = await Post.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(postId)
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
            $addFields: {
                userId: {
                    $first: '$userInfo'
                }
            }
        },
        {
            $lookup: {
                from: 'posts',
                localField: '_id',
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
                localField: '_id',
                foreignField: 'postId',
                as: 'postLikes'
            }
        },
        {
            $addFields: {
                likeCount: {
                    $size: '$postLikes.userIdArray'
                },
                userLiked: {
                    $in: [currentUser, {$ifNull: [{ $first: '$postLikes.userIdArray' }, []]}]
                }
            }
        },
        {
            $project: {
                text: 1,
                mediaFiles: 1,
                userId: 1,
                parentPost: 1,
                isPublic: 1,
                createdAt: 1,
                updatedAt: 1,
                replyCount: 1,
                likeCount: 1,
                userId: 1,
                userLiked: 1,
                postLikes: {
                    userIdArray: 1
                }
            }
        }
    ])

    return result[0]
}

const postReplies = async (postId, currentUser) => {
    const result = await Post.aggregate([
        {
            $match: {
                parentPost: new mongoose.Types.ObjectId(postId)
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
            $addFields: {
                userId: {
                    $first: '$userInfo'
                }
            }
        },
        {
            $lookup: {
                from: 'posts',
                localField: '_id',
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
                localField: '_id',
                foreignField: 'postId',
                as: 'postLikes'
            }
        },
        {
            $addFields: {
                likeCount: {
                    $size: {$first: '$postLikes.userIdArray'}
                },
                userLiked: {
                    $in: [currentUser, {$ifNull: [{ $first: '$postLikes.userIdArray' }, []]}]
                }
            }
        },
        {
            $project: {
                text: 1,
                mediaFiles: 1,
                userId: 1,
                parentPost: 1,
                isPublic: 1,
                createdAt: 1,
                updatedAt: 1,
                replyCount: 1,
                likeCount: 1,
                userId: 1,
                userLiked: 1,
                postLikes: {
                    userIdArray: 1
                }
            }
        }
    ])

    return result
}

const parentPostHierarchy = async (postId, currentUser) => {
    const result = await Post.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(postId)
            }
        },
        {
            $graphLookup: {
                from: 'posts',
                startWith: '$parentPost',
                connectFromField: 'parentPost',
                connectToField: '_id',
                as: 'hierarchy'
            }
        },
        {
            $project: {
                replies: 1,
                hierarchy: {
                    $reverseArray: {
                        $sortArray: {
                            input: '$hierarchy',
                            sortBy: { createdAt: 1 }
                        }
                    }
                }
            }
        },
        {
            $unwind: '$hierarchy'
        },
        {
            $lookup: {
                from: 'posts',
                localField: 'hierarchy._id',
                foreignField: 'parentPost',
                as: 'replies'
            }
        },
        {
            $addFields: {
                'hierarchy.replyCount': {$size: '$replies'}
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'hierarchy.userId',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        {
            $addFields: {
                'hierarchy.userId': {
                    $first: '$userInfo'
                }
            }
        },

        {
            $lookup: {
                from: 'likes',
                localField: 'hierarchy._id',
                foreignField: 'postId',
                as: 'postLikes'
            }
        },
        {
            $addFields: {
                'hierarchy.likeCount': {
                    $size: {$first: '$postLikes.userIdArray'}
                },
                'hierarchy.userLiked': {
                    $in: [currentUser, {$ifNull: [{ $first: '$postLikes.userIdArray' }, []]}]
                }
            }
        },
        {
            $group: {
                _id: '$_id',
                text: { $first: '$text' },
                mediaFiles: { $first: '$mediaFiles' },
                userId: { $first: '$userId' },
                parentPost: { $first: '$parentPost' },
                isPublic: { $first: '$isPublic' },
                createdAt: { $first: '$createdAt' },
                updatedAt: { $first: '$updatedAt' },
                hierarchy: { $push: '$hierarchy' }, // Reassemble the hierarchy array
            },
        },
    ])

    return result[0]?.hierarchy || []
}

export {
    publishPost,
    updatePost,
    deletePost,
    getPostById,
    getAllPosts,
}

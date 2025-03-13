import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncRequestHandler.js";
import fs from 'fs'
import { destroyOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/post.models.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.models.js";
import { User } from "../models/user.models.js";
import { io } from "../app.js";
import { Notification, NotificationType } from "../models/notification.models.js";
import { Repost } from "../models/repost.models.js";
import { Bookmark } from "../models/bookmark.models.js";
import { Follow } from "../models/follow.models.js";

const publishPost = asyncHandler(async (req, res) => {
    const { text, parentPostId } = req.body
    const { mediaFiles = [] } = req.files

    console.log("MediaFile during upload: ", mediaFiles)
    let parentPostInfo
    const publicIds = []
    const mediaFileUrls =  []
    const publish = {}
    let mentions = []

    if(text?.trim()){
        publish.text = text

        const postMentions = text.match(/@([\w.-]+)/g)

        mentions = postMentions ? postMentions.map(username => username.slice(1)) : []
    }

    try {
        if(req?.baseUrl === '/reply'){
            const parentPost = await Post.findById(parentPostId)
            if(!parentPost) throw new ApiError(400, 'Parent post not found')

            parentPostInfo = parentPost
            publish.parentPost = parentPostId
        }

        if (
            mediaFiles.some(file => {
                const [type, subtype] = file.mimetype.split('/');
                return type !== 'image' && !(type === 'video' && subtype === 'mp4');
            })
        ) {
            throw new ApiError(400, 'Only images and MP4 videos are allowed');
        }

        for(const file of mediaFiles){
            try {
                const response = await uploadOnCloudinary(file?.path)
                mediaFileUrls.push(response.secure_url)
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


            if(mentions.length > 0){
                const usersMentioned = await User.find(
                    {username: {$in: mentions}},
                    {_id: 1}
                ).then(users => users.map(user => user?._id))

                usersMentioned.map(async (userId) => {
                    if(req?.user?._id?.toString() !== userId?.toString()){
                        const notificationCreated = await Notification.create({
                            senderUserId: req?.user?._id,
                            receiverUserId: userId,
                            type: NotificationType.MENTION,
                            message: `@${req?.user?.username} mentioned you in a post`,
                            relatedPostId: postCreated?._id

                        })

                        if(!notificationCreated) throw new ApiError(400, 'error creating notification')

                        io.to(userId?.toString()).emit('newNotification', {
                            senderUserId: req?.user,
                            receiverUserId: userId,
                            type: NotificationType.MENTION,
                            message: `@${req?.user?.username} mentioned you in a post`,
                            relatedPostId: postCreated

                        })
                    }
                })


            }

            if(parentPostInfo){
                const receiverUser = await User.findById(parentPostInfo?.userId)

                if(req.user?._id?.toString() !== receiverUser?._id?.toString()){
                    const notificationCreated = await Notification.create({
                        senderUserId: req?.user?._id,
                        receiverUserId: receiverUser?._id,
                        type: NotificationType.REPLY,
                        message: `Replying to @${receiverUser?.username}`,
                        postReplyId: postCreated?._id,
                        relatedPostId: parentPostInfo?._id
                    })

                    if(!notificationCreated) throw new ApiError(400, 'error creating notification')


                    io.to(parentPostInfo?.userId.toString()).emit('newNotification', {
                        _id: notificationCreated?._id,
                        senderUserId: req?.user,
                        receiverUserId: receiverUser,
                        type: notificationCreated?.type,
                        message: notificationCreated?.message,
                        postReplyId: postCreated,
                        relatedPostId: parentPostInfo
                    })
                }
            }

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

        console.error("Upload error: ", error);
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
                mediaFileUrls.push(response.secure_url)
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

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const post = await Post.findById(postId)

        if(!post) throw new ApiError(400, 'Post not found')

        if(post.userId.toString() !== req.user._id.toString()){
            throw new ApiError(400, 'user unauthorized')
        }

        await recursivePostDelete(post, session)

        await session.commitTransaction()
        await session.endSession()



        return res.status(200).json(new ApiResponse(200, post, 'Post deletion successfull'))
    } catch (error) {

        await session.abortTransaction()
        await session.endSession()
        throw new ApiError(400, error?.message || 'something went wrong while deleting post')
    }

})

const recursivePostDelete = async (post, session) => {
    try {
        await Post.deleteOne({_id: post?._id}, {session})

        if(post?.mediaFiles){
            for(const url of post.mediaFiles){
                const mediaUrl = url.split('/')
                const publicId = mediaUrl[mediaUrl.length - 1].split('.')[0]

                await destroyOnCloudinary(publicId)
            }
        }

        await Repost.deleteMany({postId: post?._id}, {session})

        await Like.deleteMany({postId: post?._id}, {session})

        await Notification.deleteMany({relatedPostId: post?._id}, {session})

        await Bookmark.updateMany(
            { postIdArray: post?._id },
            { $pull: { postIdArray: post?._id } },
            { session }
        )

        const childPosts = await Post.find({parentPost: post?._id}).select('_id')

        for(const childPost of childPosts){
            await recursivePostDelete(childPost, session)
        }

    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong while deleting post')
    }
}

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

const getFollowingPosts = asyncHandler(async (req, res) => {
    const { page } = req.query

    const currentUser = req?.user?._id ? new mongoose.Types.ObjectId(req.user._id) : ''

    try {

        const posts = await Follow.aggregate([
            {
                $match: {
                    userIdArray: req?.user?._id
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'post'
                }
            },
            {
                $unwind: "$post"
            },
            {
                $match: {
                    'post.parentPost': null
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'post.userId',
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
                    localField: 'post._id',
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
                    localField: 'post._id',
                    foreignField: 'postId',
                    as: 'postLikes'
                }
            },
            {
                $lookup: {
                    from: 'reposts',
                    localField: 'post._id',
                    foreignField: 'postId',
                    as: 'reposts'
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
                    },
                    userReposted: {
                        $gt: [
                            {
                              $size: {
                                $filter: {
                                  input: '$reposts',
                                  as: 'repost',
                                  cond: { $eq: ['$$repost.userId', currentUser] }
                                }
                              }
                            },
                            0
                        ]
                    },
                    repostCount: {
                      $size: {
                        $ifNull: ['$reposts', []]
                      }
                    }
                }
            },
            {
                $lookup: {
                    from: 'bookmarks',
                    let: { postId: '$post._id' },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ['$userId', currentUser] },
                              { $in: ['$$postId', '$postIdArray'] }
                            ]
                          }
                        }
                      }
                    ],
                    as: 'bookmarkInfo'
                }
            },
            {
                $addFields: {
                    userBookmarked: {$gt: [{$size: { $ifNull: ['$bookmarkInfo', []] } }, 0]}
                }
            },
            {
                $sort : { 'post.createdAt': -1}
            },
            {
                $skip: (page - 1) * 10
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: '$post._id',
                    text: '$post.text',
                    mediaFiles: '$post.mediaFiles',
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
                    parentPost:'$post.parentPost',
                    isPublic: '$post.isPublic',
                    createdAt: '$post.createdAt',
                    updatedAt: '$post.updatedAt',
                    replyCount: 1,
                    likeCount: 1,
                    userLiked: 1,
                    userBookmarked: 1,
                    userReposted: 1,
                    repostCount: 1

                }
            }
        ])

        return res.status(200).json(new ApiResponse(200, posts, 'followingPosts fetched success'))
    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong')
    }

})

const getQueriedPost = asyncHandler(async (req, res) => {
    const {query = '', page} = req.query

    const currentUser = req?.user?._id ? new mongoose.Types.ObjectId(req.user._id) : ''
    const pipeline = []

    pipeline.push(
        {
            $sort: { createdAt: -1 }
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
        }
    )


    if(query?.trim()){


        pipeline.push(
            {
                $match: {
                    $or: [
                        {text: {$regex: query, $options: 'i'}},
                        {'userId.username': {$regex: query, $options: 'i'}},
                        {'userId.fullname': {$regex: query, $options: 'i'}},

                    ]
                }
            },{
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
                $lookup: {
                    from: 'reposts',
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'reposts'
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
                    },
                    userReposted: {
                        $gt: [
                            {
                              $size: {
                                $filter: {
                                  input: '$reposts',
                                  as: 'repost',
                                  cond: { $eq: ['$$repost.userId', currentUser] }
                                }
                              }
                            },
                            0
                        ]
                    },
                    repostCount: {
                      $size: {
                        $ifNull: ['$reposts', []]
                      }
                    }
                }
            },
            {
                $lookup: {
                    from: 'bookmarks',
                    let: { postId: '$_id' },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ['$userId', currentUser] },
                              { $in: ['$$postId', '$postIdArray'] }
                            ]
                          }
                        }
                      }
                    ],
                    as: 'bookmarkInfo'
                }
            },
            {
                $addFields: {
                    userBookmarked: {$gt: [{$size: { $ifNull: ['$bookmarkInfo', []] } }, 0]}
                }
            },
            {
                $sort : { createdAt: -1}
            },
            {
                $skip: (page - 1) * 10
            },
            {
                $limit: 10
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
                    userLiked: 1,
                    userBookmarked: 1,
                    userReposted: 1,
                    repostCount: 1

                }
            }
        )
    }

    try {
        const posts = await Post.aggregate(pipeline)

        return res.status(200).json(new ApiResponse(200, posts, 'posts fetched success'))

    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong')
    }
})

const getAllPosts = asyncHandler(async (req, res) => {
    const { page } = req.query
    console.log(page)

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
                $lookup: {
                    from: 'reposts',
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'reposts'
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
                    },
                    userReposted: {
                        $gt: [
                            {
                              $size: {
                                $filter: {
                                  input: '$reposts',
                                  as: 'repost',
                                  cond: { $eq: ['$$repost.userId', currentUser] }
                                }
                              }
                            },
                            0
                        ]
                    },
                    repostCount: {
                      $size: {
                        $ifNull: ['$reposts', []]
                      }
                    }
                }
            },
            {
                $lookup: {
                    from: 'bookmarks',
                    let: { postId: '$_id' },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ['$userId', currentUser] },
                              { $in: ['$$postId', '$postIdArray'] }
                            ]
                          }
                        }
                      }
                    ],
                    as: 'bookmarkInfo'
                }
            },
            {
                $addFields: {
                    userBookmarked: {$gt: [{$size: { $ifNull: ['$bookmarkInfo', []] } }, 0]}
                }
            },
            {
                $sort : { createdAt: -1}
            },
            {
                $skip: (page - 1) * 10
            },
            {
                $limit: 10
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
                    userLiked: 1,
                    userBookmarked: 1,
                    userReposted: 1,
                    repostCount: 1

                }
            }
        ])


        return res.status(200).json(new ApiResponse(200, posts, 'posts fetched successfully'))
    } catch (error) {
        throw new ApiError(400, error?.message || 'somrhting went wrong')
    }
})

const mostRepostedPost = asyncHandler(async (req, res) => {
    const { page } = req.query
    console.log(page)
    const currentUser = req?.user?._id ? new mongoose.Types.ObjectId(req.user._id) : ''

    try {
        const posts = await Post.aggregate([
            {
                $sort: {createdAt : -1}
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
                $lookup: {
                    from: 'reposts',
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'reposts'
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
                    },
                    userReposted: {
                        $gt: [
                            {
                              $size: {
                                $filter: {
                                  input: '$reposts',
                                  as: 'repost',
                                  cond: { $eq: ['$$repost.userId', currentUser] }
                                }
                              }
                            },
                            0
                        ]
                    },
                    repostCount: {
                      $size: {
                        $ifNull: ['$reposts', []]
                      }
                    }
                }
            },
            {
                $lookup: {
                    from: 'bookmarks',
                    let: { postId: '$_id' },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ['$userId', currentUser] },
                              { $in: ['$$postId', '$postIdArray'] }
                            ]
                          }
                        }
                      }
                    ],
                    as: 'bookmarkInfo'
                }
            },
            {
                $addFields: {
                    userBookmarked: {$gt: [{$size: { $ifNull: ['$bookmarkInfo', []] } }, 0]}
                }
            },
            {
                $sort : { repostCount: -1}
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
                    userLiked: 1,
                    userBookmarked: 1,
                    userReposted: 1,
                    repostCount: 1

                }
            }
        ])


        return res.status(200).json(new ApiResponse(200, posts, 'posts fetched successfully'))
    } catch (error) {
        throw new ApiError(400, error?.message || 'somrhting went wrong')
    }
})

const getUserPosts = asyncHandler(async (req, res) => {
    const { username } = req.params
    const currentUser = req?.user?._id ? new mongoose.Types.ObjectId(req.user._id) : ''

    try {
        const userInfo = await User.findOne({username})

        if(!userInfo) throw new ApiError(400, 'user does not exist')

        const posts = await userPosts(userInfo, currentUser)
        const replies = await userReplies(userInfo, currentUser)
        const liked = await postsLiked(userInfo, currentUser)

        const repliesWithParentPost = await Promise.all(
            replies.map(async (reply) => {
                const parentPost = await parentPostHierarchy(reply?._id, currentUser)
                return {...reply, parentPost}
            })
        )

        return res.status(200).json(new ApiResponse(200, {posts, repliesWithParentPost, liked}, "user posts fetched successfully"))
    } catch (error) {
        throw new ApiError(400, error?.message || 'error fetching posts')
    }
})


export const postDetail = async (postId, currentUser) => {
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
            $lookup: {
                from: 'reposts',
                localField: '_id',
                foreignField: 'postId',
                as: 'reposts'
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
                },
                userReposted: {
                    $gt: [
                        {
                          $size: {
                            $filter: {
                              input: '$reposts',
                              as: 'repost',
                              cond: { $eq: ['$$repost.userId', currentUser] }
                            }
                          }
                        },
                        0
                    ]
                },
                repostCount: {
                  $size: {
                    $ifNull: ['$reposts', []]
                  }
                }
            }
        },
        {
            $lookup: {
                from: 'bookmarks',
                let: { postId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$userId', currentUser] },
                          { $in: ['$$postId', '$postIdArray'] }
                        ]
                      }
                    }
                  }
                ],
                as: 'bookmarkInfo'
            }
        },
        {
            $addFields: {
                userBookmarked: {$gt: [{$size: { $ifNull: ['$bookmarkInfo', []] } }, 0]}
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
                userBookmarked: 1,
                userReposted: 1,
                repostCount: 1
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
            $lookup: {
                from: 'reposts',
                localField: '_id',
                foreignField: 'postId',
                as: 'reposts'
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
                },
                userReposted: {
                    $gt: [
                        {
                          $size: {
                            $filter: {
                              input: '$reposts',
                              as: 'repost',
                              cond: { $eq: ['$$repost.userId', currentUser] }
                            }
                          }
                        },
                        0
                    ]
                },
                repostCount: {
                  $size: {
                    $ifNull: ['$reposts', []]
                  }
                }
            }
        },
        {
            $lookup: {
                from: 'bookmarks',
                let: { postId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$userId', currentUser] },
                          { $in: ['$$postId', '$postIdArray'] }
                        ]
                      }
                    }
                  }
                ],
                as: 'bookmarkInfo'
            }
        },
        {
            $addFields: {
                userBookmarked: {$gt: [{$size: { $ifNull: ['$bookmarkInfo', []] } }, 0]}
            }
        },
        {
            $sort : { createdAt: -1}
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
                userReposted: 1,
                userBookmarked: 1,
                repostCount: 1
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
                hierarchy: {
                    $reverseArray: {
                        $sortArray: {
                            input: '$hierarchy',
                            sortBy: { createdAt: -1 }
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
            $lookup: {
                from: 'reposts',
                localField: 'hierarchy._id',
                foreignField: 'postId',
                as: 'reposts'
            }
        },
        {
            $addFields: {
                'hierarchy.likeCount': {
                    $size: {
                        $ifNull: [{ $first: '$postLikes.userIdArray' }, []]
                    }
                },
                'hierarchy.userLiked': {
                    $in: [currentUser, {$ifNull: [{ $first: '$postLikes.userIdArray' }, []]}]
                },
                'hierarchy.userReposted': {
                    $gt: [
                        {
                          $size: {
                            $filter: {
                              input: '$reposts',
                              as: 'repost',
                              cond: { $eq: ['$$repost.userId', currentUser] }
                            }
                          }
                        },
                        0
                    ]
                },
                'hierarchy.repostCount': {
                  $size: {
                    $ifNull: ['$reposts', []]
                  }
                }
            }
        },
        {
            $lookup: {
                from: 'bookmarks',
                let: { postId: '$hierarchy._id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$userId', currentUser] },
                          { $in: ['$$postId', '$postIdArray'] }
                        ]
                      }
                    }
                  }
                ],
                as: 'bookmarkInfo'
            }
        },
        {
            $addFields: {
                'hierarchy.userBookmarked': {$gt: [{$size: { $ifNull: ['$bookmarkInfo', []] } }, 0]}
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
                hierarchy: { $push: '$hierarchy' },
            },
        },
    ])

    return result[0]?.hierarchy || []
}

const userPosts = async (user, currentUser) => {
    const result = await Post.aggregate([
        {
            $match: {
                userId: user?._id,
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
            $lookup: {
                from: 'reposts',
                localField: '_id',
                foreignField: 'postId',
                as: 'reposts'
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
                },
                userReposted: {
                    $gt: [
                        {
                          $size: {
                            $filter: {
                              input: '$reposts',
                              as: 'repost',
                              cond: { $eq: ['$$repost.userId', currentUser] }
                            }
                          }
                        },
                        0
                    ]
                },
                repostCount: {
                  $size: {
                    $ifNull: ['$reposts', []]
                  }
                }
            }
        },
        {
            $lookup: {
                from: 'bookmarks',
                let: { postId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$userId', currentUser] },
                          { $in: ['$$postId', '$postIdArray'] }
                        ]
                      }
                    }
                  }
                ],
                as: 'bookmarkInfo'
            }
        },
        {
            $addFields: {
                userBookmarked: {$gt: [{$size: { $ifNull: ['$bookmarkInfo', []] } }, 0]}
            }
        },
        {
            $sort: { createdAt: -1 }
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
                userLiked: 1,
                userBookmarked: 1,
                userReposted: 1,
                repostCount: 1

            }
        }
    ])

    return result
}

const userReplies = async (user, currentUser) => {
    const result = await Post.aggregate([
        {
            $match: {
                userId: user?._id,
                parentPost: { $ne: null }
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
                localField: 'parentPost',
                foreignField: '_id',
                as: 'parentPost'
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
            $lookup: {
                from: 'reposts',
                localField: '_id',
                foreignField: 'postId',
                as: 'reposts'
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
                },
                userReposted: {
                    $gt: [
                        {
                          $size: {
                            $filter: {
                              input: '$reposts',
                              as: 'repost',
                              cond: { $eq: ['$$repost.userId', currentUser] }
                            }
                          }
                        },
                        0
                    ]
                },
                repostCount: {
                  $size: {
                    $ifNull: ['$reposts', []]
                  }
                }
            }
        },
        {
            $lookup: {
                from: 'bookmarks',
                let: { postId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$userId', currentUser] },
                          { $in: ['$$postId', '$postIdArray'] }
                        ]
                      }
                    }
                  }
                ],
                as: 'bookmarkInfo'
            }
        },
        {
            $addFields: {
                userBookmarked: {$gt: [{$size: { $ifNull: ['$bookmarkInfo', []] } }, 0]}
            }
        },
        {
            $sort: { createdAt: -1 }
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
                isPublic: 1,
                createdAt: 1,
                updatedAt: 1,
                replyCount: 1,
                likeCount: 1,
                userLiked: 1,
                userBookmarked: 1,
                userReposted: 1,
                repostCount: 1
            }
        }
    ])

    return result
}

const postsLiked = async (user, currentUser) => {
    const result = await Like.aggregate([
        {
            $match: {
                userIdArray: new mongoose.Types.ObjectId(user?._id)
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
                from: 'users',
                localField: 'postsLiked.userId',
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
            $lookup: {
                from: 'reposts',
                localField: 'postsLiked._id',
                foreignField: 'postId',
                as: 'reposts'
            }
        },
        {
            $addFields: {
                likeCount: {
                    $size: {$first: '$postLikes.userIdArray'}
                },
                userLiked: {
                    $in: [currentUser, {$ifNull: [{$first: '$postLikes.userIdArray'}, []]}]
                },
                userReposted: {
                    $gt: [
                        {
                          $size: {
                            $filter: {
                              input: '$reposts',
                              as: 'repost',
                              cond: { $eq: ['$$repost.userId', currentUser] }
                            }
                          }
                        },
                        0
                    ]
                },
                repostCount: {
                  $size: {
                    $ifNull: ['$reposts', []]
                  }
                }
            }
        },
        {
            $lookup: {
                from: 'bookmarks',
                let: { postId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$userId', currentUser] },
                          { $in: ['$$postId', '$postIdArray'] }
                        ]
                      }
                    }
                  }
                ],
                as: 'bookmarkInfo'
            }
        },
        {
            $addFields: {
                userBookmarked: {$gt: [{$size: { $ifNull: ['$bookmarkInfo', []] } }, 0]}
            }
        },
        {
            $group: {
                _id: '$postsLiked._id',
                text: {$first: '$postsLiked.text'},
                mediaFiles: {$first: '$postsLiked.mediaFiles'},
                userId: {$first: '$userId'},
                parentPost: {$first: '$postsLiked.parentPost'},
                isPublic: {$first: '$postsLiked.isPublic'},
                createdAt: {$first: '$postsLiked.createdAt'},
                updatedAt: {$first: '$postsLiked.updatedAt'},
                replyCount: {$first: '$replyCount'},
                likeCount: {$first: '$likeCount'},
                userLiked: {$first: '$userLiked'},
                userBookmarked: {$first: '$userBookmarked'},
                userReposted: {$first: '$userReposted'},
                repostCount: {$first: '$repostCount'},

            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    return result
}

export {
    publishPost,
    updatePost,
    deletePost,
    getPostById,
    getAllPosts,
    getUserPosts,
    getFollowingPosts,
    getQueriedPost,
    mostRepostedPost
}

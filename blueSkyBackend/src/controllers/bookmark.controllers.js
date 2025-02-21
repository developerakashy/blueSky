import mongoose from "mongoose";
import { Bookmark } from "../models/bookmark.models.js";
import { Post } from "../models/post.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncRequestHandler.js";

const toggleBookmark = asyncHandler(async (req, res) => {
    const { postId } = req.params
    try {
        let bookmark = await Bookmark.findOne({userId: req?.user?._id})

        if(!bookmark){
            await Bookmark.create({
                userId: req?.user?._id
            })

            bookmark = await Bookmark.findOne({userId: req?.user?._id})
        }
        console.log(bookmark)
        const post = await Post.findById(postId)

        if(!post) throw new ApiError(400, 'post not found')

        const isPostThere = bookmark?.postIdArray?.indexOf(post?._id) === -1 ? false : true

        if(isPostThere){
            await Bookmark.findByIdAndUpdate(bookmark?._id, {
                $pull: {
                    postIdArray: post?._id
                }
            })
        } else {
            await Bookmark.findByIdAndUpdate(bookmark?._id, {
                $push: {
                    postIdArray: post?._id
                }
            })
        }

        const bookmarkUpdated = await Bookmark.findById(bookmark?._id)

        return res.status(200).json(new ApiResponse(200, bookmarkUpdated, 'post bookmark toggled'))

    } catch (error) {
        throw new ApiError(400, 'something went wrong while toggling the bookmark')
    }
})

const getUserBookmark = asyncHandler(async (req, res) => {

    const currentUser = req?.user?._id ? new mongoose.Types.ObjectId(req.user._id) : ''

    try {
        const bookmark = await Bookmark.aggregate([
            {
                $match: {
                    userId: req?.user?._id
                }
            },
            {
                $unwind: '$postIdArray'
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'postIdArray',
                    foreignField: '_id',
                    as: 'postInfo'
                }
            },
            {
                $project: {
                    _id: {$first: '$postInfo._id'},
                    text: {$first: '$postInfo.text'},
                    userId: {$first: '$postInfo.userId'},
                    mediaFiles: {$first: '$postInfo.mediaFiles'},
                    parentPost: {$first: '$postInfo.parentPost'},
                    isPublic: {$first: '$postInfo.isPublic'},
                    createdAt: {$first: '$postInfo.createdAt'},
                    updatedAt: {$first: '$postInfo.updatedAt'},
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
                    userBookmarked: true,
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
                $sort: {
                    createdAt: -1
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
                    userLiked: 1,
                    userBookmarked: 1,
                    userReposted: 1,
                    repostCount: 1

                }
            }
        ])

        return res.status(200).json(new ApiResponse(200, bookmark, 'user bookmark fetched'))
    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong while getting bookmark')
    }
})

export {
    toggleBookmark,
    getUserBookmark
}

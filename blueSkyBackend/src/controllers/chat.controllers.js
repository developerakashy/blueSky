import mongoose from "mongoose";
import { Chat } from "../models/chat.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncRequestHandler.js";
import { Message } from "../models/message.models.js";

const createChat = asyncHandler(async (req, res) => {
    const { userId } = req.body

    if(userId === req?.user?._id?.toString()) throw new ApiError(400, 'You cannot chat with yourself')

    try {
        const user = await User.findById(userId)

        if(!user) throw new ApiError(400, 'user not found')

        const chatExist = await Chat.findOne({
            participants: { $all: [userId, req?.user?._id] }
        })

        if(chatExist) return res.status(200).json(new ApiResponse(200, chatExist, 'chat already exist'))

        const chat = await Chat.create({
            participants: [userId, req?.user?._id],
        })

        if(!chat) throw new ApiError(400, 'something went wrong while creating chat')

        return res.status(200).json(new ApiResponse(200, chat, 'chat creation success'))

    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong while creating chat')
    }
})

const getUserChats = asyncHandler(async (req, res) => {

    try {
        const userChats = await Chat.aggregate([
            {
                $match: {
                    participants: new mongoose.Types.ObjectId(req?.user?._id),
                    deletedFor: {$ne: req?.user?._id}
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'participants',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            {
                $lookup: {
                    from: 'messages',
                    localField: 'lastMessageId',
                    foreignField: '_id',
                    as: 'chat'
                }
            },
            {
                $project: {
                    users: {
                        _id: 1,
                        username: 1,
                        fullname: 1,
                        avatar: 1,
                        coverImage: 1,
                        about: 1,
                    },
                    lastMessage: {$ifNull: [{$first: '$chat.message'}, '']}
                }
            }
        ])

        return res.status(200).json(new ApiResponse(200, userChats, 'users chats fetched'))
    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong while getting the post')
    }
})

const deleteChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params

    try {
        await Chat.updateMany(
            { _id: chatId },
            { $addToSet:
                { deletedFor: req?.user?._id }
            }
        )

        await Message.updateMany(
            { chatId },
            { $addToSet:
                { deletedFor: req?.user?._id}
            }
        )

        return res.status(200).json(new ApiResponse(200, {}, 'chat deleted suceessfully'))
    } catch  (error) {
        throw new ApiError(400, 'something went wrong while deleting chat')
    }
})

export {
    createChat,
    getUserChats,
    deleteChat
}

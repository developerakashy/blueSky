import { io } from "../app.js";
import { Chat } from "../models/chat.models.js";
import { Message } from "../models/message.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncRequestHandler.js";

const createMessage = asyncHandler(async (req, res) => {
    const { message, receiverUserId } = req.body

    if(!receiverUserId?.trim()) throw new ApiError(400, 'message receiver user should be there')
    if(!message?.trim()) throw new ApiError(400, 'message field is mandatory')

    if(receiverUserId === req?.user?._id?.toString()) throw new ApiError(400, 'you cannot message yourself')

    try {
        const chat = await Chat.findOne({
            participants: {$all: [receiverUserId, req?.user?._id]}
        })

        if(!chat) throw new ApiError(400, 'message cannot be created as chat not found')

        const messageCreated = await Message.create({
            chatId: chat?._id,
            senderUserId: req?.user?._id,
            receiverUserId,
            message
        })

        const chatLastMessage = await Chat.findByIdAndUpdate(chat?._id,
            {
                $set:{
                    lastMessageId: messageCreated?._id
                },
                $pull: {
                    deletedFor: messageCreated?.receiverUserId
                }
            },
            {
                new: true
            }
        )

        const createdMsg = await Message.findById(messageCreated?._id).populate('senderUserId receiverUserId', '-password -refreshToken')

        const chatInfo = await getChatInfo(chat?._id)

        io.to(receiverUserId).emit('newChatMessage', {
            chat: chatInfo[0],
            message: createdMsg
        })

        if(!chatLastMessage) throw new ApiError(400, 'something went wrong while updating last message')

        if(!messageCreated) throw new ApiError(400, 'something went wrong while creating a chat message')

        return res.status(200).json(new ApiResponse(200, createdMsg, 'message creation successfull'))

    } catch (error) {
            throw new ApiError(400, error?.message || 'something went wrong while creating a chat message')
    }
})

const getMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params

    try {
        const chat = await Chat.findById(chatId)

        const messages = await Message.find({chatId, deletedFor: {$ne: req?.user?._id}}).populate('senderUserId receiverUserId', '-password -refreshToken')

        const chatSender = chat?.participants[0]?.toString() === req?.user?._id?.toString() ? chat?.participants[1] : chat?.participants[0]
        const chatWithUser = await User.findById(chatSender)

        return res.status(200).json(new ApiResponse(200, {chatWithUser, messages}, 'Messages fetched successfully'))
    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong while getting messages')
    }
})

const getChatInfo = async (chatId) => {
    const chatInfo = await Chat.aggregate([
            {
                $match: {
                    _id: chatId
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
                    lastMessage: {$first: '$chat.message'}
                }
            }
        ])

    return chatInfo
}

const deleteMessages = asyncHandler(async (req, res) => {
    const {chatId} = req.params
    console.log(chatId)

    try {
        await Message.updateMany(
            { chatId },
            { $addToSet:
                { deletedFor: req?.user?._id }
            }
        )

        // await Chat.findByIdAndUpdate(chatId, {lastMessageId: null})

        return res.status(200).json(new ApiResponse(200, {}, 'message deleted'))
    } catch (error) {
        throw new ApiError(400, error?.message || 'error deleting messages')
    }
})

export {
    createMessage,
    getMessages,
    deleteMessages
}

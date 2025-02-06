import mongoose, { mongo, Schema } from "mongoose";

const chatSchema = new Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ],
    lastMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    },
    deletedFor: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
})

export const Chat = mongoose.model('Chat', chatSchema)

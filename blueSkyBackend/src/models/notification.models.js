import mongoose, { Schema } from "mongoose";

export const NotificationType = {
    LIKE: 'like', //done
    UNLIKE: 'unlike', //done
    REPLY: 'reply', //done
    MENTION: 'mention',
    FOLLOW: 'follow', //done
    UNFOLLOW: 'unfollow', //done
    REPOST: 'repost',
}

const notificationSchema = new Schema({
    senderUserId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverUserId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: Object.values(NotificationType),
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedPostId: {
        type: mongoose.Types.ObjectId,
        ref: 'Post'
    },
    postReplyId: {
        type: mongoose.Types.ObjectId,
        ref: 'Post'
    },
    isViewed: {
        type: Boolean,
        default: false
    }

}, {timestamps: true})

export const Notification = mongoose.model('Notification', notificationSchema)

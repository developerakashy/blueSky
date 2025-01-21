import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
    postId: {
        type: mongoose.Types.ObjectId,
        ref: 'Like',
        required: true
    },
    userIdArray: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }]

}, {timestamps: true})

export const Like = mongoose.model('Like', likeSchema)

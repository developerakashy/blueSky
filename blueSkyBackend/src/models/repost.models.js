import mongoose, { mongo, Schema } from "mongoose";

const repostSchema = new Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

},{ timestamps: true })

export const Repost = mongoose.model('Repost', repostSchema)

import mongoose, { Schema } from "mongoose";

const PostSchema = new Schema({
    text: {
        type: String,
    },
    mediaFiles: {
        type: [String],
        validate: [arrayLimit, '{PATH} exceeds the limit of 4']
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentPost: {
        type: mongoose.Types.ObjectId,
        ref: 'Post',
        default: null
    },
    isPublic: {
        type: Boolean,
        default: true
    }

}, {timestamps: true})

function arrayLimit(val){
    return val.length <= 4
}

export const Post = mongoose.model('Post', PostSchema)

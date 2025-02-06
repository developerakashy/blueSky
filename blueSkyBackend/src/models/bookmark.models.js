import mongoose, { Schema } from "mongoose";

const bookmarkSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postIdArray: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    ]
})

export const Bookmark = mongoose.model('Bookmark', bookmarkSchema)

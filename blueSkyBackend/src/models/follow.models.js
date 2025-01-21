import mongoose, { Schema } from "mongoose";

const followSchema = new Schema({
    userId : {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userIdArray: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }]
    
}, { timestamps: true })

export const Follow = mongoose.model('Follow', followSchema)

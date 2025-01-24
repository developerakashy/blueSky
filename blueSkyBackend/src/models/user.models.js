import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        trim: true
    },
    dob: {
        type: Date,

    },
    about: {
        type: String
    },
    avatar: {
        type: String,

    },
    coverImage: {
        type: String,
        
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    userVerificationToken: {
        type: String,
    },
    tokenExpiry: {
        type: String
    }

}, {timestamps: true})

userSchema.pre("save", async function(next){

    if(!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 10)

    next()
})

userSchema.methods.isPasswordCorrect = async function(password){

    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            fullname: this._id,
            username: this.username,
            email: this.email
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.JWT_SECRET,
        { expiresIn:process.env.REFRESH_TOKEN_EXPIRY }
    )
}

export const User = mongoose.model('User', userSchema)

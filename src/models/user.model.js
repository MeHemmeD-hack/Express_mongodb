import mongoose, { Schema } from "mongoose";
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,

    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    verifyCode: {
        type: Number,
        default: null
    },
    verifyExpired: {
        type: Date,
        default: null
    },
})

export const User = mongoose.model('user', userSchema) 
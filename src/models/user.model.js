import mongoose,{Schema} from "mongoose";
const userSchema= new mongoose.Schema({
    fullName:{
        type: String,
        required:true,
        trim:true,

    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
    },
    isVerifiedEmail: {
        type: Boolean,
    },
    password:{
        type:String,
        required:true,
        trim:true,
    }
})

export const User=mongoose.model('user', userSchema) 
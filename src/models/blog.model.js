import mongoose from "mongoose";
 const blogSchema=new mongoose.Schema({
    title:{
        type:String,
        require: true,
        trim: true
    },
    content:{
        type: String,
        trim: true,
        require: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        require: true
    }, 
    filePath: {
        type: String, 
        default: null,
    }

 }) 
 export const Blog = mongoose.model("Blog", blogSchema);
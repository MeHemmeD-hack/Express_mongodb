import express from "express"
import 'dotenv/config'
import mongoose from "mongoose"
import { appRouter } from "./src/routes/index.js"
const app=express()
app.use(express.json())

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("MongoDB connected")
})
.catch((err)=>{
    console.log(err.message, "error")
})
app.use('/api',appRouter)

const port=process.env.PORT
app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
}) 

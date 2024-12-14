import express from "express"
import 'dotenv/config'
import mongoose from "mongoose"
import { appRouter } from "./src/routes/index.js"
import { User } from "./src/models/user.model.js"
import cors from 'cors'
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true })); 
app.use(cors({
    origin: "*" 
}))
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB connected")
    })
    .catch((err) => {
        console.log(err.message, "error")
    })
app.use('/api', appRouter)

app.get('/users', async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json(users)
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

app.put('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        })
        if (!user) return res.status(404).json({ message: "user not found " })
        res.status(200).json(user)
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        })

    }
})
app.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) return res.status(404).json({
            message: "user not found"
        })
        res.status(200).json({
            message: "user deleted"
        })
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        })

    }
})

const port = process.env.PORT
app.listen(port, () => {
    console.log(`server is running on port ${port}`)
}) 
import express from 'express'
import { authRoute } from './auth.route.js'
export const appRouter=express.Router()
appRouter.use('/auth', authRoute)
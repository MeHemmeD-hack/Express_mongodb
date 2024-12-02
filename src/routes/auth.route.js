import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { useAuth } from "../middlewares/auth.middleware.js";
export const authRoute = express.Router()

const controller = AuthController()


authRoute.post('/login', controller.login)
authRoute.post('/register', controller.register)
authRoute.post('/verify-email', useAuth,controller.verifyEmail)
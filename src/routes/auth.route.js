import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { useAuth } from "../middlewares/auth.middleware.js";
import { saveResetToken } from "../middlewares/error.middleware.js";
export const authRoute = express.Router()

const controller = AuthController()


authRoute.post('/login', controller.login)
authRoute.post('/register', controller.register)
authRoute.post('/verify-email', useAuth,controller.verifyEmail)
authRoute.post('/verify-code', useAuth,controller.checkVerifyCode)
authRoute.post('/forget-password', saveResetToken, controller.forgetPassword)
authRoute.post('/reset-password/:token',  controller.resetPassword)

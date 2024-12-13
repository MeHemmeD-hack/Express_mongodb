import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { appconfig } from "../../consts.js";

export const useAuth = async (req, res, next) => {

    console.log("useAuth middleware ist olundu");

    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
        return res.status(401).json({
            message: "Token tapilmadi"
        })
    }

    const access_token = req.headers.authorization.split(" ")[1];
    if (!access_token) return res.status(401).json({
        message: "Token tapilmadi"
    })

    try {
        const jwtResult = jwt.verify(access_token, appconfig.SECRET_KEY)

        const user = await User.findById(jwtResult.sub).select("_id email fullName isEmailVerified verifyExpired verifyCode")
        if (!user) return res.status(401).json({ message: "User not found!" });

        req.user = user;

        next();

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error,
        })
    }
}
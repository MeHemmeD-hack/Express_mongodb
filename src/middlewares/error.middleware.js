import {v4 as uuidv4} from "uuid"
import { User } from "../models/user.model.js";
export const saveResetToken = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email address is required!" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No account found with this email address!" });
        }

        const resetToken = uuidv4();
        const tokenExpireTime = Date.now() + 3600000; 
        
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = tokenExpireTime;

        await user.save();

        req.resetURL = `http://localhost:5173/reset-password/${resetToken}`;
        req.userEmail = user.email;

        console.log("Reset Token Saved:", user.resetPasswordToken);
        next(); 
    } catch (error) {
        console.error("Save Reset Token Middleware Error:", error);
        return res.status(500).json({ message: "Server error occurred while saving reset token." });
    }
};

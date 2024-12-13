import Joi from "joi";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";
import { appconfig } from "../../consts.js";
import nodemailer from "nodemailer"
import crypto from 'crypto'

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: appconfig.EMAIL,
        pass: appconfig.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

const register = async (req, res, next) => {
    try {
        const schema = Joi.object({
            fullName: Joi.string().trim().min(3).max(35).required(),
            email: Joi.string().trim().email().required(),
            password: Joi.string().trim().min(8).max(35).required(),
        });

        const data = await schema.validateAsync(req.body, { abortEarly: false });

        data.password = await bcrypt.hash(data.password, 10);

        const newUser = await User.create(data);
        res.status(201).json(newUser);

    } catch (err) {
        if (err.isJoi) {
            return res.status(400).json({ message: err.details.map(detail => detail.message) });
        }
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        });

        const data = await schema.validateAsync(req.body, { abortEarly: false });

        const user = await User.findOne({ email: data.email });
        if (!user) {
            return res.status(401).json({ message: 'Email or password incorrect' });
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email or password incorrect' });
        }

        const payload = { sub: user._id };
        const jwt_secret = process.env.SECRET_KEY;

        if (!jwt_secret) {
            throw new Error('SECRET_KEY is not defined in environment variables');
        }

        const token = jwt.sign(payload, jwt_secret, { expiresIn: '1h' });

        res.status(200).json({ token });

    } catch (err) {
        if (err.isJoi) {
            return res.status(400).json({ message: err.details.map(detail => detail.message) });
        }
        next(err);
    }
};


const verifyEmail = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "İstifadəçi tapılmadı." });
        }


        if (user.isEmailVerified) {
            return res.status(400).json({ message: "Bu email artıq təsdiqlənmişdir." });
        }


        const verifyCode = Math.floor(100000 + Math.random() * 900000);
        const now = new Date();
        const verifyExpired = new Date(now.getTime() + 5 * 60 * 1000);



        user.verifyCode = verifyCode;
        user.verifyExpired = verifyExpired;

        await user.save()


        const email = user.email;
        const mailOptions = {
            from: appconfig.EMAIL,
            to: email,
            subject: "Verify code",
            html: `
            <p style="font-size: 16px">Your verification code is:</p>
            <p style="font-size: 24px; font-weight: bold; color: white; background-color: #007BFF; padding: 10px; border-radius: 5px; text-align: center;">
                ${verifyCode}
            </p>
            <p style="color: red; font-size: 18px">It is valid for 5 minutes.</p>
        `,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email göndərilmə xətası: ", error);
                return res.status(500).json({ message: "Email göndərilmə xətası baş verdi." });
            } else {
                return res.status(200).json({ message: "Təsdiq kodu emailinizə göndərildi." });
            }
        });
    } catch (err) {
        console.error("Verify email error:", err);
        next(err);
    }
};



const checkVerifyCode = async (req, res) => {
    try {
        const validData = await Joi.object({
            code: Joi.string()
                .length(6)
                .regex(/^[0-9]+$/)
                .required()
            // .messages({
            //     "object.regex": "Must have at least 8 characters",
            // }),
        }).validateAsync(req.body, { abortEarly: false })

        const user = req.user;
        if (user.isEmailVerified) {
            return res.status(200).json({
                message: "Email is already verification"
            })
        }

        if (!user.verifyCode) {
            return res.status(400).json({
                message: "Verification code not found!"
            })
        }


        // check expired date
        if (user.verifyExpired < new Date()) {
            return res.status(400).json({
                message: "Verification code is expired!"
            })
        }

        // +validData.code -> 123456
        if (user.verifyCode !== Number(validData.code)) {
            return res.status(400).json({
                message: "Verification code is incorrect!"
            })
        }

        user.isEmailVerified = true;
        user.verifyCode = null;
        user.verifyExpired = null;

        await user.save();
        return res.status(200).json("Emailiniz təsdiqləndi.");
    } catch (err) {
        console.error("checkVerifyCode error:", err);
        return res.status(500).send("Server xətası.");
    }
};

const forgetPassword = async (req, res) => {
    try {
        const validData = await Joi.object({
            email: Joi.string()
                .email()
                .required()
                .messages({
                    "string.email": "Valid email is required!",
                    "string.empty": "Email field cannot be empty!",
                }),
        }).validateAsync(req.body, { abortEarly: false });

        const { email } = validData;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "No account found with this email address!"
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpireTime = Date.now() + 3600000; // 1 saat

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = tokenExpireTime;
        await user.save();

        const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

        console.log(user.resetToken)
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: appconfig.EMAIL,
                pass: appconfig.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false, 
            },
        });
        

        const mailOptions = {
            to: user.email,
            subject: 'Password Reset',
            html: `
                <p>Click the link below to reset your password:</p>
                <a href="${resetURL}" target="_blank">Reset Password</a>
                <p>If you did not request this, please ignore this email.</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: "Password reset link has been sent to your email address.",
        });

    } catch (error) {
        console.error("Forget Password Error:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};


const resetPassword=async(req, res)=>{
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Şifrələr uyğun gəlmir!" });
    }

    try {
        const user = await User.findOne({ 
            resetPasswordToken: token, 
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: "Yanlış və ya müddəti keçmiş sıfırlama tokeni" });
        }

        user.password = newPassword; 
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        return res.status(200).json({ message: "Şifrə uğurla sıfırlandı!" });
    } catch (error) {
        console.error("Şifrə sıfırlanarkən xəta:", error);
        return res.status(500).json({ message: "Şifrə sıfırlanarkən xəta baş verdi." });
    }
}


export const AuthController = () => ({
    login,
    register,
    verifyEmail,
    checkVerifyCode,
    forgetPassword,
    resetPassword
})

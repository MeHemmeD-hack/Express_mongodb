import Joi from "joi";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";
import { appconfig } from "../../consts.js";
import nodemailer from "nodemailer"

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
            subject: "Təsdiq kodu",
            text: `Təsdiq kodunuz: ${verifyCode}`,
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
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(400).send("İstifadəçi tapılmadı.");
        }

        const code = req.body.code;
        if (!user.verifyCode) {
            return res.status(400).send("Təsdiq kodu tapılmadı.");
        }

        if (user.verifyCode !== Number(code)) {
            return res.status(400).send("Kod düzgün deyil.");
        }

        if (Date.now() > user.verifyExpired) {
            return res.status(400).send("Təsdiq kodunun vaxtı bitmişdir.");
        }

       
        user.verifyCode = null;
        user.verifyExpired = null;
        user.isEmailVerified = true;
        await user.save();

        return res.status(200).json("Emailiniz təsdiqləndi.");
    } catch (err) {
        console.error("checkVerifyCode error:", err);
        return res.status(500).send("Server xətası.");
    }
};





export const AuthController = () => ({
    login,
    register,
    verifyEmail,
    checkVerifyCode
})

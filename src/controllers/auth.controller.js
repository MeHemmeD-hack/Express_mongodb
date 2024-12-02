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
    
    const user = req.user;
    console.log(user);
    const email = req.user.email

    const mailOptions = {
        from: appconfig.EMAIL,
        to: email,
        subject: "Hello from Div Mongo Blog",
        text: "Verify your Email address",
    };

    // console.log("mailOptions", mailOptions); 


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email: ", error);
            return res.status(500).json({
                message: error.message,
                error,
            })
        } else {
            console.log("Email sent: ", info);
            return res.json({ message: "Check your email" })
        }
    });
}
export const AuthController = () => ({
    login,
    register,
    verifyEmail
})

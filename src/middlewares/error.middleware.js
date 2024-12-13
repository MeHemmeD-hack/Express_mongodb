import jwt from "jsonwebtoken";

export const validateEmail =async (req, res, next) => {
    const { email } = req.body;
    console.dir(req.body)
    if (!email) {
        return res.status(400).json({ message: "Email tələb olunur." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Düzgün email ünvanı daxil edin." });
    }

    try {
        
    } catch (error) {
        
    }
    next();
};
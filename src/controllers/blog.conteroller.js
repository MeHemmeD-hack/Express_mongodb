import Joi from "joi";
import { Blog } from "../models/blog.model.js";
import multer from "multer";
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url";

// const num =0

// if(!isNaN(num)){
//     res.status(200).json(num)
// }
// else{
//     res.status(500).json(num)
// }
const create = async (req, res, next) => {
    const user = req.user

    if (!user.isEmailVerified) return res.status(400).json({
        message: "User email is not verified."
    })

    const { title, content } = await Joi.object({
        title: Joi.string().trim().min(3).max(50).required(),
        content: Joi.string().trim().min(10).max(1000).required(),
    }).validateAsync(req.body, { abortEarly: false })
        .catch(err => {
            return res.status(422).json({
                message: 'xeta bash verdi.',
                error: err.details.map(item => item.message)

            })
        })
    await Blog.create({
        title,
        content,
        user: user.id
    }).then(newBlog => res.status(201).json(newBlog))
        .catch(error => res.status(500).json({
            message: "xeta",
            error
        }))
}

const getList = async (req, res, next) => {
    try {
        const list = await Blog.find().populate('user', 'fullName').select("_id title user")
        res.json(list)
    } catch (error) {
        console.error("xetaaa deyerleri")
        res.status(500).json({
            message: "xeta yarandi",
            error: error.message
        })
    }
}
const getById = async (req, res, next) => {
    const id = req.params.id

    if (!id) {
        return res.status(400).json({
            message: "Id required"
        });
    }

    try {
        const blog = await Blog.findById(id).populate("user", "fullName");

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.json(blog);
    } catch (error) {
        console.error("Xəta:", error);
        res.status(500).json({
            message: "Xəta yarandı",
            error: error.message
        });
    }
};

const blogEdit = async (req, res, next) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        })
        if (!blog) return res.status(404).json({
            message: "blog yoxdur"

        })
        res.status(200).json(blog)
    } catch (error) {
        res.status(500).json({
            message: err.message
        })

    }
}
const blogDelete = async (req, res, next) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id, {
        })
        if (!blog) return res.status(404).json({
            message: "istifadəçiyə aid blog tapılmadı"

        })
        res.status(200).json({
            message: "blog uğurla silindi"
        })
    } catch (error) {
        res.status(500).json({
            message: err.message
        })

    }
}


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "uploads", "blogs");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Yalnız şəkillər yüklənə bilər!');
    }
}


const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 }, 
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('myFile');

const uploadFilesForBlog =async (req, res) => {
    const blogId = req.params.blogId;

    try {
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog tapılmadı." });
        }

        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: "Fayl yüklənmədi.", error: err });
            }

            if (!req.file) {
                return res.status(400).json({ message: "Fayl seçilməyib." });
            }

            blog.filePath = req.file.path;
            await blog.save();

            res.status(200).json({
                message: "Fayl uğurla yükləndi və bloga əlavə edildi.",
                blog
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Xəta baş verdi.", error });
    }
};


export const BlogController = () => ({
    create,
    getList,
    getById,
    blogEdit,
    blogDelete,
    uploadFilesForBlog
})
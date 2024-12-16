import { Router } from "express";
import { BlogController } from "../controllers/blog.conteroller.js";
import { useAuth } from "../middlewares/auth.middleware.js";
import multer from "multer";
import { appconfig } from "../../consts.js";
export const blogRoute = Router()
const controller = BlogController()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        // const filename = Date.now() + "-" + file.originalname;
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename)
    }
})

// const upload = multer({ dest: 'uploads/' })

const upload = multer({
    storage,
    fileFilter: (_, file, cb) => {
        // if (file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        // if (appConfig.allowedImageTypes.includes(file.mimetype)) {
        // if (appconfig.allowedImageTypes.indexOf(file.mimetype) !== -1) {
            cb(null, true)
        // } else {
            // cb(new Error("File type must be jpeg or png"), false)
         // }
    }
})



blogRoute.post("/create",useAuth, upload.array('img',3), controller.create)
blogRoute.get("/list", controller.getList)
blogRoute.get("/:id", controller.getById)
blogRoute.put("/edit/:id", controller.blogEdit)
blogRoute.delete("/delete/:id", controller.blogDelete)
blogRoute.post("/upload-files", useAuth, controller.uploadFilesForBlog)


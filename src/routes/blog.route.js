import { Router } from "express";
import { BlogController } from "../controllers/blog.conteroller.js";
import { useAuth } from "../middlewares/auth.middleware.js";

export const blogRoute=Router()
const controller=BlogController()

blogRoute.post("/create",
    // useAuth
     controller.create)
blogRoute.get("/list", controller.getList)
blogRoute.get("/:id",controller.getById)
blogRoute.put("/edit/:id",controller.blogEdit)
blogRoute.delete("/delete/:id",controller.blogDelete)
blogRoute.post("/:blogId/upload-files",controller.uploadFilesForBlog)


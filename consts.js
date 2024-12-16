export const appconfig={
    port:process.env.PORT,
    MONGO_URL:process.env.MONGO_URL,
    SECRET_KEY:process.env.SECRET_KEY,
    EMAIL:process.env.EMAIL,
    EMAIL_PASSWORD:process.env.EMAIL_PASSWORD,
    allowedImageTypes: ["image/jpg", "image/jpeg", "image/png"]
}
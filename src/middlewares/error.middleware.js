export const errorMiddleware=(req,res,err,next)=>{
    console.error(err);
    if(err.isJoi) return res.status(400).json({
        message:err.details[0].message
    })
}
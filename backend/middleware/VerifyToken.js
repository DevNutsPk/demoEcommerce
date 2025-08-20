require('dotenv').config()
const jwt=require('jsonwebtoken')
const { sanitizeUser } = require('../utils/SanitizeUser')

exports.verifyToken=async(req,res,next)=>{
    try {
        // extract the token from request cookies
        const {token}=req.cookies

        // if token is not there, return 401 response
        if(!token){
            return res.status(401).json({message:"Token missing, please login again"})
        }

        // verifies the token 
        const decodedInfo=jwt.verify(token,process.env.SECRET_KEY)

        // checks if decoded info contains legit details, then set that info in req.user and calls next
        if(decodedInfo && decodedInfo._id && decodedInfo.email){
            req.user=decodedInfo
            next()
        }

        // if token is invalid then sends the response accordingly
        else{
            return res.status(401).json({message:"Invalid Token, please login again"})
        }
        
    } catch (error) {

        console.log(error);
        
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Token expired, please login again" });
        } 
        else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Invalid Token, please login again" });
        } 
        else {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

// Legacy admin check (for backward compatibility)
exports.verifyIsAdmin=(req,res,next)=>{
    try {
        if(!req.user){
            return res.status(401).json({message:"Token missing, please login again"})
        }
        if(req.user.role !== 'super_admin' && req.user.role !== 'sub_admin'){
            return res.status(403).json({message:"Access denied. Admins only."})
        }
        next()
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// Super Admin only access
exports.verifyIsSuperAdmin=(req,res,next)=>{
    try {
        if(!req.user){
            return res.status(401).json({message:"Token missing, please login again"})
        }
        if(req.user.role !== 'super_admin'){
            return res.status(403).json({message:"Access denied. Super Admin only."})
        }
        next()
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// Admin access (Super Admin or Sub Admin)
exports.verifyIsAdminRole=(req,res,next)=>{
    try {
        if(!req.user){
            return res.status(401).json({message:"Token missing, please login again"})
        }
        if(req.user.role !== 'super_admin' && req.user.role !== 'sub_admin'){
            return res.status(403).json({message:"Access denied. Admin role required."})
        }
        next()
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// Check if user has specific permission
exports.hasPermission=(permission)=>{
    return (req,res,next)=>{
        try {
            if(!req.user){
                return res.status(401).json({message:"Token missing, please login again"})
            }
            
            const permissions = {
                'super_admin': ['all'],
                'sub_admin': ['create_product', 'update_product', 'read_products', 'read_orders'],
                'user': ['read_products', 'create_order', 'read_own_orders']
            }
            
            const userPermissions = permissions[req.user.role] || []
            
            if(userPermissions.includes('all') || userPermissions.includes(permission)){
                next()
            } else {
                return res.status(403).json({message:`Access denied. Permission '${permission}' required.`})
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}
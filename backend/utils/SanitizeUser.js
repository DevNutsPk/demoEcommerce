exports.sanitizeUser=(user)=>{
    if (!user) return null; // prevent crash
    return {_id:user._id,email:user.email,isVerified:user.isVerified,isAdmin:user.isAdmin}
}
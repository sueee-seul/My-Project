
export function isAdmin(req, res, next){
    if(!req.user){
        return res.status(401).json({error: "Authentication failed"});
    }

    if(req.user.is_admin === 1){
        next();
    }else{
        res.status(403).json({error: "Admin privilege required."});
    }
}
import {findUserByEmail} from "../data/user-dao.js";
import {getEmailFromJWT} from "../utils/jwt-utils.js";

export async function requiresAuthentication(req, res, next){
    const token = req.cookies?.authToken;
    if(!token) return res.sendStatus(401);

    try{
        const email = getEmailFromJWT(token);
        const user = await findUserByEmail(email);
        if(!user) return res.sendStatus(401);

        req.user = user;
        //move admin-middleware
        next();
    }catch(err){
        console.error("Authentication Failed: ", err.message || err);
        return res.sendStatus(401);
    }
}

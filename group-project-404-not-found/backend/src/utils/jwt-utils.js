import jwt from "jsonwebtoken"

const JWT_KEY = process.env.JWT_KEY?.trim() || "uoa-swap-dev-secret";

export function getEmailFromJWT(token){

    const decoded = jwt.verify(token, JWT_KEY);
    if(!decoded.email) throw `JWT is valid but did not contain an email.`;
    return decoded.email;
}

export function createUserJWT(email, expiresIn = "24h"){
    return jwt.sign({email}, JWT_KEY, {expiresIn});
}

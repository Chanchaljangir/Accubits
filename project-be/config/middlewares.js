const jwt = require('jsonwebtoken');
const redis_client = require('../redis_connect');
const User = require("../models/user");
 
function verifyToken(req, res, next) {
    try {
        // Bearer tokenstring
        const token = req.headers.authorization;

        const decoded = jwt.verify(token, process.env.SECRET);
        req.userData = decoded;

        req.token = token;

        // varify blacklisted access token.
        redis_client.get('BL_' + decoded.sub.toString(), (err, data) => {
            if(err) throw err;

            if(data === token) return res.status(401).json({status: false, message: "blacklisted token."});
            next();
        })
    } catch (error) {
        return res.status(401).json({status: false, message: "Your session is not valid.", data: error});
    }
}

function verifyRefreshToken(req, res, next) {
    const token = req.body.token;

    if(token === null) return res.status(401).json({status: false, message: "Invalid request."});
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        req.userData = decoded;
        console.log(" req.userData", req.userData)
        // User.findOne({
        //     email:  req.userData.email
        // }, (err, user) => {
        //     if (err) {
        //         res.status(401).send({
        //             success: false,
        //             message: "Invaild token"
        //         });
        //         return false;
        //     } else {
        //         next();
        //     }
        // })

        // verify if token is in store or not
        redis_client.get(decoded.sub.toString(), (err, data) => {
            if(err) throw err;

            if(data === null) return res.status(401).json({status: false, message: "Invalid request. Token is not in store."});
            if(JSON.parse(data).token != token) return res.status(401).json({status: false, message: "Invalid request. Token is not same in store."});

            next();
        })
    } catch (error) {
        return res.status(401).json({status: true, message: "Your session is not valid.", data: error});
    }
}

module.exports = {
    verifyToken,
    verifyRefreshToken
}
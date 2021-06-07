let express = require("express");
let router = express.Router();
var jwt = require('jsonwebtoken');
let _user = require("../controllers/user");
const User = require("../models/user");
const auth_middleware = require('../config/middlewares');
/* Auth Middleware */

function authMiddleware(req, res, next) {
    if (req.headers.authorization) {
        jwt.verify(req.headers.authorization, process.env.SECRET, function (err, decode) {
            if (err) {
                res.status(401).send({
                    success: false,
                    message: "Invaild token"
                });

            } else {
                User.findOne({
                    email: decode.email,
                    password: decode.password
                }, (err, user) => {
                    if (err) {
                        res.status(401).send({
                            success: false,
                            message: "Invaild token"
                        });
                        return false;
                    } else {
                        next();
                    }
                })
            }
        })
    } else {
        res.status(401).send({
            success: false,
            message: "Invaild Authorization"
        });
    }
}

/* Middleware  End */


// Get Homepage
router.get("/", function (req, res) {
    res.json({
        API: "1.0"
    });
});

//auth
// function authMiddleware(req, res, next) {
router.post("/registerUser", _user.addUser);
router.post("/login", _user.authenticateUser);
router.get("/getAllUsers", auth_middleware.verifyToken , _user.getUsers);
router.get("/getSpecificUser/:id", authMiddleware , _user.getSpecificUser);

router.post('/token', auth_middleware.verifyRefreshToken, _user.GetAccessToken);
module.exports = router;
// "use strict";
const User = require("../models/user");
const mongoose = require("mongoose");
// const config = require("../config/db");
// const bcrypt = require("bcryptjs");
var _ = require("lodash");
const jwt = require("jsonwebtoken");

async function addUser(req, res) { 
    try {
        let checkEmail = await User.findOne({ email: req.body.email });
        if (checkEmail) {
            res.status(200).send({
                IsSuccess: false,
                message: "user already registered",
                code: 422
            })
        } else {
            let newUser = new User(req.body);
            

            const userPick = _.pick(newUser, [
                "name", "email", "password"
            ])

            const token = jwt.sign(userPick, process.env.SECRET, {
                expiresIn: process.env.JWT_ACCESS_TIME
            });
            newUser.token = token;
            const result = await newUser.save();
            result
                ? res.status(200).send({
                    IsSuccess: true,
                    message: "User registered",
                    res: {
                        token: token,
                        user: {
                            id: newUser._id,
                            email: newUser.email
                        }
                    }
                })
                : res
                    .status(422)
                    .send({ IsSuccess: false, message: "fail to register", res: result });

        }

    } catch (err) {
        console.log(err);
        res.send(err);
    }
}
async function getUsers(req, res) {
    try {
        // var limit = req.body.pageSize || 5;
        // var pageNum = req.body.page || 1;

        // var skip = limit * (pageNum - 1);

        let UserCount = await User.count();
        const result = await User.find()
            // .limit(parseInt(limit)).skip(parseInt(skip));;
        result
            ? res.status(200).send({
                IsSuccess: true,
                message: "all Users",
                res: result,
                count: UserCount
            })
            : res.status(422).send({
                IsSuccess: false,
                message: "not getting any User"
            });
    } catch (err) {
        res.send(err);
    }
}



async function authenticateUser(req, res) {
    let password = req.body.password;
    let email = req.body.email;

    await User.findOne({ email: email }).exec((err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({ IsSuccess: false, msg: "email or password mismatch" });
        } else {
            user.comparedPassword(password, (error, isMatch) => {
                if (isMatch && !error) {

                    const userPick = _.pick(user, [
                        "name", "email", "password"
                    ])
                    const token = jwt.sign(userPick, process.env.SECRET, {
                        expiresIn: process.env.JWT_ACCESS_TIME
                    });
                    const refresh_token = GenerateRefreshToken(userPick);
                    res.json({
                        IsSuccess: true,
                        accessToken: token,
                        refreshToken: refresh_token,
                        user: {
                            id: user._id,
                            email: user.email,
                            name: user.name
                        }
                    });
                } else {
                    return res.json({ IsSuccess: false, msg: "email or password mismatch" });
                }
            })
        }

    })
}
function GetAccessToken (req, res) {
    const decoded = jwt.verify(req.body.token, process.env.JWT_REFRESH_SECRET);
    const reqData = decoded;
    const userPick = _.pick(reqData, [
        "name", "email", "password"
    ])
    // const access_token = jwt.sign(userPick, process.env.SECRET, {
    //     expiresIn: '60s' //1 day
    // });
    const access_token = jwt.sign(userPick, process.env.SECRET, { expiresIn: process.env.JWT_ACCESS_TIME});
    const refresh_token = GenerateRefreshToken(userPick);
    console.log("refresh_token GetAccessToken###",refresh_token)
    return res.json({status: true, message: "success", data: {access_token, refresh_token}});
}

function GenerateRefreshToken(userData) {
    const refresh_token = jwt.sign(userData, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_TIME });
    redis_client.get(userData.toString(), (err, data) => {
        if(err) throw err;

        redis_client.set(userData.toString(), JSON.stringify({token: refresh_token}));
    })

    return refresh_token;
}
async function getSpecificUser(req, res) {
    try {
        const result = await User.findById({
            _id: req.params.id
        }).select("-password")
        result ? res.status(200).send({
            message: "particular User is recieved",
            IsSuccess: true,
            Data: result
        }) :
            res.status(422).send({
                message: "particular User is not recieved",
                IsSuccess: false
            })
    } catch (error) {
        res.send(error);
    }
}



module.exports = {
    addUser,
    authenticateUser,
    getUsers,
    getSpecificUser,
    GetAccessToken
};

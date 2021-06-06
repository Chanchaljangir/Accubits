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
            const result = await newUser.save();

            const userPick = _.pick(newUser, [
                "name", "email", "password"
            ])

            const token = jwt.sign(userPick, process.env.SECRET, {
                expiresIn: '1d' //1 day
            });
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
        var limit = req.body.pageSize || 5;
        var pageNum = req.body.page || 1;

        var skip = limit * (pageNum - 1);

        let UserCount = await User.count();
        const result = await User.find().select('name email')
            .limit(parseInt(limit)).skip(parseInt(skip));;
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
                        expiresIn: '1d' //1 day
                    });
                    res.json({
                        IsSuccess: true,
                        token: token,
                        user: {
                            id: user._id,
                            email: user.email,
                            name: user.name,
                            image: user.profilePicUrl
                        }
                    });
                } else {
                    return res.json({ IsSuccess: false, msg: "email or password mismatch" });
                }
            })
        }

    })
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
};

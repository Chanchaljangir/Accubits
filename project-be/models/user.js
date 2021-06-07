"use strict";
const mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

const UserSchema = mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'password is required']
    },
})
UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err)
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                console.log(hash)
                if (err) {
                    return next(err)
                }
                user.password = hash;
                next();
            })
        })
    } else {
        return next();
    }
});

// compare input passwod with stored database

UserSchema.methods.comparedPassword = function (pw, cb) {


    bcrypt.compare(pw, this.password, function (err, isMatch) {
        console.log('matched')
        console.log(isMatch)
        if (err) {
            console.log("err in metching...", err);
            return cb(err);
        }
        cb(null, isMatch)
    })
}

const User = module.exports = mongoose.model("User", UserSchema);

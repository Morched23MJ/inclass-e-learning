const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = (id, callback) => {
    User.findById(id, callback);
}

module.exports.getUserByUsername = (username, callback) => {
    let query = { username: username };
    User.findOne(query, callback);
}

module.exports.getUserByEmail = (email, callback) => {
    let query = { email: email };
    User.findOne(query, callback);
}

module.exports.addUser = (payload, callback) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(payload.password, salt, (err, hash) => {
            if (err) throw err;
            else {
                payload.password = hash;
                payload.save(callback);
            }
        });
    });
}

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    });
}
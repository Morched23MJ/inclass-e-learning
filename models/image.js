const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

const ImageSchema = mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    fileID: {
        type: String,
        required: true
    }
});

const Image = module.exports = mongoose.model('Image', ImageSchema);
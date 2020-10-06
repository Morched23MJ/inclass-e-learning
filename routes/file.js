const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');

const config = require('../config/database');
const upload = require('../app');
const Image = require('../models/image');

router.post('/', upload.single('file'), (req, res, next) => {
    Image.findOne({ filename: req.body.filename })
        .then(image => {
            if (image) res.status(200).json({
                success: false,
                message: "Image already exists"
            })
            else {
                let newImage = new Image({
                    filename: req.body.filename,
                    fileID: req.file.id
                })

                newImage.save()
                    .then(image => res.status(200).json({
                        success: true,
                        image
                    }))
                    .catch(err => res.status(500).json(err));
            }
        })
        .catch(err => res.status(500).json(err));
});

module.exports = router;
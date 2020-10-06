const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');

const config = require('../config/database');
const User = require('../models/user');

// Register
router.post('/register', (req, res, next) => {
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  User.addUser(newUser, (err, user) => {
    if (err) {
      res.json({
        success: false,
        message: 'Failed to register user'
      });
    } else if (user) {
      res.json({
        success: true,
        message: 'User successfully registered'
      });
    } else {
      res.json({
        success: false,
        message: 'An error occured'
      })
    }
  })
});

// Authenticate
router.post('/authenticate', (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  User.getUserByEmail(email, (err, user) => {
    if (err) throw err;
    else if (!user) {
      res.json({
        success: false,
        message: "Invalid user credentials"
      });
    } else {
      User.comparePassword(password, user.password, (err, isMatch) => {
        if (err) throw err;
        else if (isMatch) {
          const token = jwt.sign(user.toJSON(), config.secret, {
            expiresIn: 604800 // 1 week
          });
          res.json({
            success: true,
            token: `JWT ${token}`,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email
            }
          });
        }
        else {
          res.json({
            success: false,
            message: 'Wrong password'
          })
        }
      })
    }
  });
});

// Profile
router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res, next) => {
  res.send('PROFILE');
});

module.exports = router;
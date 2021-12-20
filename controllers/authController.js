const User = require('../models/user');

const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');

exports.sign_up_get = function (req, res) {
  res.render('sign-up', { title: 'Sign Up' });
};

exports.sign_up_post = [
  body('username', 'Username should be at least 2 characters long!')
    .trim()
    .isLength({ min: 2, max: 100 })
    .escape(),
  body('password', 'Password should be at least 2 characters long!')
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body('confirmPassword')
    .trim()
    .isLength({ min: 2 })
    .escape()
    .withMessage('Confirmation password should be at least 2 characters long!')
    .custom(async (value, { req }) => {
      // Use the custom method w/ a CB func to ensure that both passwords match, return an error if so
      if (value !== req.body.password) throw new Error('Passwords must be the same!');
      return true;
    }),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Error');
      return res.render('sign-up', { title: 'Sign Up', errors: errors.array() });
    }

    try {
      const existingUser = await User.find({ username: req.body.username });
      if (existingUser.length > 0) {
        return res.render('sign-up', {
          title: 'Sign Up',
          errors: [{ msg: 'This username is already taken!' }],
        });
      }
      // If username does not exist, continute to register new user to db
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) return next(err);
        const user = new User({
          username: req.body.username,
          password: hashedPassword
        }).save((err) => {
          if (err) return next(err);
          res.render('sign-up', {
            title: 'Sign Up',
            msg: 'You successfully signed up, please log in :)',
          });
        });
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.log_in_get = function (req, res) {
  res.render('log-in', { title: 'Log in' });
};

exports.log_in_post = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/log-in',
  failureFlash: true,
});

exports.log_out_get = function (req, res) {
  req.logout();
  res.redirect('/');
};
const express = require("express");
const bcrypt = require('bcrypt');
const helpers = require('../helpers');
const router = express.Router();

// User Model
const User = require('../models/User');

// @route   GET /register
// @desc    Render register page
router.get('/', (req, res) => {
  let templateVars = {
    user: ''
  };
  res.render('urls_register', templateVars);
});

// @route   POST /register
// @desc    Create login credentials
// WORKS
router.post('/', (req, res) => {
  const userId = helpers.generateRandomString();
  const userEmail = req.body.email;
  const userPassword = bcrypt.hashSync(req.body.password, 10);
  let emptyField = false;

  if (userEmail.length === 0 || userPassword.length === 0) {
    emptyField = true;
  }

  if (emptyField) {
    res.status(400).send('One or both of the email or password fields is/are empty!');
  } else {
    User
      .findOne({
        email: userEmail
      })
      .then(obj=> {
        if (obj !== null) {
          res.status(400).send('The email is already in our database!');
        } else {
          const newAccount = new User({
            id: userId,
            email: userEmail,
            password: userPassword
          });
          newAccount.save();
          res.redirect('/urls');
        }
      })
      .catch(err => {
        console.log(err);
      });
  }
});

module.exports = router;

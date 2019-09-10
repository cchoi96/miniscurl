const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

// User Model
const User = require('../models/User');

router.use(cookieSession({
  name: 'user_id',
  keys: [ "id" ]
}));

// @route   GET /login
// @desc    Render login page
router.get('/', (req, res) => {
  let templateVars = {
    user: ''
   };
  res.render('urls_login', templateVars);
});

// @route   POST /login
// @desc    Send email & password
router.post('/', (req, res) => {
  User
    .findOne({
      email: req.body.email
    })
    .then(userObj => {
      if (bcrypt.compareSync(req.body.password, userObj.password)) {
        req.session.user_id = userObj.id;
        res.redirect('/urls');
      } else {
        res.status(403).send('The password is not valid!');
      }
    })
    .catch(err => {
      console.log(err);
      res.status(403).send('The email is not valid!');
    })
});

module.exports = router;
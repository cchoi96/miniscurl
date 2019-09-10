const express = require('express');
const cookieSession = require('cookie-session');
const router = express.Router();

// Url Model
const Url = require('../models/Url');

router.use(cookieSession({
  name: 'user_id',
  keys: [ "id" ]
}));

router.get('/u/:shortURL', (req, res) => {
  Url
    .findOne({
      shortUrl: req.params.shortURL
    })
    .then(urlObj => {
      res.redirect(urlObj.longUrl);
    })
    .catch(err => {
      console.log(err);
      res.redirect('/urls');
    })
});

module.exports = router;
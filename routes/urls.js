const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const helpers = require('../helpers');
const router = express.Router();

// Url Model
const Url = require('../models/Url');
const User = require('../models/User');

router.use(bodyParser.urlencoded({ extended: true }));

router.use(cookieSession({
  name: 'user_id',
  keys: [ "id" ]
}));
router.use(methodOverride('_method'));

// @route   GET /urls/new
// @desc    Checks if logged in, then renders URL creation page
router.get('/new', (req, res) => {
  if (req.session.user_id) {
    User
      .findOne({
        id: req.session.user_id
      })
      .then(userObj => {
        let templateVars = {
          user: userObj
        };
        res.render('urls_new', templateVars);
      })
  } else {
    res.redirect("/login");
  }
});

// @route   DELETE /urls/:shortURL/delete
// @desc    Deletes shortURL entry
router.delete('/:shortURL/delete', (req, res) => {
  Url
    .findOne({ 
      userID: req.session.user_id,
      shortUrl: req.params.shortURL
    })
    .then(urlObj => {
      urlObj.remove()
      .then(res.redirect('/urls'))
      .catch(err => {
        res.json(err);
      })
    })
    .catch(err => {
      console.log(err);
      res.redirect('/urls');
    });
});

// @route   PUT /urls/:shortURL/edit
// @desc    Modifies shortURL entries
router.put('/:shortURL/edit', (req, res) => {
  Url
    .findOneAndUpdate({
      userID: req.session.user_id,
      shortUrl: req.params.shortURL
    }, {
      longUrl: helpers.longUrlHasHTTP(req.body.longURL)
    })
    .then(() => {
      res.redirect('/urls');
    })
    .catch(err => {
      console.log(err);
      res.redirect('/urls');
    });
});

// @route   POST /urls/:shortURL/edit
// @desc    Checks if user can modify shortURL (if logged in)
router.post('/:shortURL', (req, res) => {
  Url
    .findOne({
      userID: req.session.user_id,
      shortUrl: req.params.shortURL
    })
    .then(res.redirect(`/urls/${req.params.shortURL}`))
    .catch(err => {
      console.log(err);
      res.redirect('/urls');
    });
});

router.get('/:shortURL', (req, res) => {
  Url
    .findOne({
      userID: req.session.user_id,
      shortUrl: req.params.shortURL
    })
    .then(urlObj => {
      User
        .findOne({ id: req.session.user_id })
        .then((userObj) => {
          let templateVars = {
            user: userObj,
            shortURL: urlObj.shortUrl,
            longURL: urlObj.longUrl,
          };
          res.render('urls_show', templateVars);
        })
        .catch(err => {
          console.log(err);
          res.redirect('/urls');
        });
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

// @route   GET /urls
// @desc    Shows URL collection
router.get('/', (req, res) => {
  Url
    .find({
      userID: req.session.user_id
    })
    .then(urlObj => {
      const filteredUrl = {};
      for (let url in urlObj) {
        filteredUrl[urlObj[url].shortUrl] = urlObj[url].longUrl;
      }
      User
        .findOne({ id: req.session.user_id })
        .then(userObj => {
          let templateVars = {
            user: userObj,
            urls: filteredUrl,
            errorMsg: false
          };
          res.render('urls_index', templateVars);
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        })
    })
    .catch(err => {
      console.log(err);
      res.redirect('/');
    });
});

// @route   POST /urls
// @desc    Adds new shortURL entry if it does not already exist in database
router.post('/', (req, res) => {
  Url
    .findOne({
      longUrl: req.body.longURL
    })
    .then(urlObj => {
      const filteredUrl = {};
      for (let url in urlObj) {
        filteredUrl[urlObj[url].shortUrl] = urlObj.longUrl;
      }
      let templateVars = {
        user: urlObj.userID,
        urls: filteredUrl,
        errorMsg: true
      };
      res.render('urls_index', templateVars);
    })
    .catch(() => {
      const newShortURL = helpers.generateRandomString();
      const newUrl = new Url({
        shortUrl: newShortURL,
        longUrl: req.body.longURL,
        userID: req.session.user_id
      });
      newUrl.save();
      res.redirect(`/urls/${newShortURL}`);
    });
});

module.exports = router;
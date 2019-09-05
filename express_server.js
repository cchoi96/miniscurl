const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const helpers = require('./helpers');
// -------------------------------------------------------------------------------------------------------------

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'user_id',
  keys: [ "id" ]
}));
app.use(methodOverride('_method'));
// -------------------------------------------------------------------------------------------------------------

// DATABASES
  // Examples of database structures provided
let urlDatabase = {
  // 'b2xVn2': { longURL: 'https://www.lighthouselabs.ca', userID: 'Cd3fs3' },
  // '9sm5xK': { longURL: 'https://www.google.com', userID: 'dsflk3' }
};

let users = {
  // Example of what the user database looks like
  // 'Chris': {
  //   id: 'Chris',
  //   email: 'chrischoi96@gmail.com',
  //   password: 'chrischoi96'
  // }
};
// -------------------------------------------------------------------------------------------------------------


// GLOBAL VARIABLES
  // To count unique visitors
let uniqueVisitors = {};
let uniqueCounter = 0;
let counter = 0;

// -------------------------------------------------------------------------------------------------------------

// ROUTE HANDLERS
  // New URL Page
app.get('/urls/new', (req, res) => {
  if (req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]
    };
    res.render('urls_new', templateVars);
  } else {
    res.redirect("/login");
  }
});

  // Individual URL Page
  // Checks if shortURL exists, and if not, redirects to main url page, and if so, redirects to the actual longURL page
app.get('/u/:shortURL', (req, res) => {
  if (!uniqueVisitors[req.session.user_id]) {
    let timeStamp = Date.now();
    let date = new Date(timeStamp).toLocaleDateString('en-US', {timeZone: "America/New_York"});
    let time = new Date(timeStamp).toLocaleTimeString('en-US', {timeZone: "America/New_York"});
    uniqueCounter++;
    uniqueVisitors[req.session.user_id] = `${date} : ${time}`;
  }
  counter++;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (req.params.shortURL === 'undefined') {
    res.redirect('/urls');
    return;
  } else {
    res.redirect(longURL);
  }
});

  // Deletes shortURL & longURL from database based on shortURL
app.delete('/urls/:shortURL/delete', (req, res) => {
  // Checks if the userID in database matches the cookie ID
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

  // Edits the longURL in database
app.put('/urls/:shortURL/edit', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    urlDatabase[req.params.shortURL].longURL = helpers.longUrlHasHTTP(req.body.longURL);
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.post('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      uniqueVisitorsCounter: uniqueCounter,
      visitors: counter,
      uniqueVisitorsObj: uniqueVisitors
    };
    res.render('urls_show', templateVars);
  } else {
    res.status(400).send('You are not allowed access to this url! Please login to the correct account.');
  }
});

  // Main URL Page
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    // req.cookies['user_id'] returns an array of one value
    urls: helpers.urlsForUser([req.session.user_id].toString(), urlDatabase),
    errorMsg: false };
  res.render('urls_index', templateVars);
});

  // Checks if longURL already exists in the database, and if it does, redirect to the urls page with an error msg. If it does not, then add the shortURL: longURL to the database
app.post('/urls', (req, res) => {
  let urlExists = false;
  let userDatabase = helpers.urlsForUser(req.session.user_id, urlDatabase);
  for (let key in userDatabase) {
    if (req.body.longURL === urlDatabase[key].longURL) {
      urlExists = true;
      break;
    }
  }
  if (urlExists) {
    let templateVars = {
      user: users[req.session.user_id],
      urls: helpers.urlsForUser([req.session.user_id].toString(), urlDatabase),
      errorMsg: true };
    res.render('urls_index', templateVars);
  } else {
    const shortURL = helpers.generateRandomString();
    urlDatabase[shortURL] = {
      longURL: helpers.longUrlHasHTTP(req.body.longURL),
      userID: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

  // Registering Page
app.get('/register', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase,
    errorMsg: false };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const id = helpers.generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  let emptyField = false;

  if (email.length === 0 || password.length === 0) {
    emptyField = true;
  }

  if (emptyField) {
    res.status(400).send('One or both of the email or password fields is/are empty!');
  } else {
    if (helpers.checkEmail(email, users) !== -1) {
      res.status(400).send('The email is already in our database!');
    } else {
      users[id] = { id, email, password };
      req.session.user_id = id;
      res.redirect('/urls');
    }
  }
});

  // Login Page
app.get('/login', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase,
    errorMsg: false };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  // User is either -1 (if not found in database), or user
  const user = helpers.checkEmail(email, users);
  if (user !== -1) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      res.redirect('/urls');
    } else {
      res.status(403).send("The password is not valid!");
    }
  } else {
    res.status(403).send("The email is not valid!");
  }
});

  // Logout Page
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/');
});

  // Index Page
app.get('/', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase,
    errorMsg: false };
  res.render('urls_home', templateVars);
});
// -------------------------------------------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
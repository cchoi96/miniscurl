const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// generates the short URL, 6 characters long
const generateRandomString = () => {
  let string = '';
  const length = 6;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charsLength = chars.length;
  for (let i = 0; i < length; i++) {
    string += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return string;
};

// Checks if user input longURL has https:// or http:// at beginning of string, and if not, adds it
const longUrlHasHTTP = longURL => {
  let regex = new RegExp('^https{0,1}://');
  return regex.test(longURL) ? longURL : `https://${longURL}`;
};

let urlDatabase = {
  'b2xVn2': 'https://www.lighthouselabs.ca',
  '9sm5xK': 'https://www.google.com'
};

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// checks if shortURL exists, and if not, redirects to main url page, and if so, redirects to the actual longURL page
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (req.params.shortURL === 'undefined') {
    res.redirect('/urls');
    return;
  } else {
    res.redirect(longURL);
  }
});

// Deletes shortURL & longURL from database based on shortURL
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Edits the longURL in database
app.post('/urls/:shortURL/edit', (req, res) => {
  urlDatabase[req.params.shortURL] = longUrlHasHTTP(req.body.longURL);
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});


app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  console.log(req);
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
    errorMsg: false };
  res.render('urls_index', templateVars);
});

// Checks if longURL already exists in the database, and if it does, redirect to the urls page with an error msg. If it does not, then add the shortURL: longURL to the database
app.post('/urls', (req, res) => {
  let urlExists = false;
  for (let key in urlDatabase) {
    if (req.body.longURL === urlDatabase[key]) {
      urlExists = true;
      break;
    }
  }
  if (urlExists) {
    let templateVars = {
      username: req.cookies["username"],
      urls: urlDatabase,
      errorMsg: true };
    res.render('urls_index', templateVars);
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = longUrlHasHTTP(req.body.longURL);
    res.redirect(`/urls/${shortURL}`);
  }
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
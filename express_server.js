const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// -------------------------------------------------------------------------------------------------------------

// FUNCTIONS

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

// Checks if email exists in user database, returns user object if email exists
const checkEmail = email => {
  let keys = Object.keys(users);
  for (let key of keys) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return -1;
}

// Returns URLs where userID === id of user currently logged in

const urlsForUser = id => {
  let personalUrls = {};
  let keys = Object.keys(urlDatabase);
  for (key of keys) {
    if (urlDatabase[key].userID === id) {
      personalUrls[key] = urlDatabase[key].longURL;
    }
  }
  return personalUrls;
};

// -------------------------------------------------------------------------------------------------------------

// DATABASES

let urlDatabase = {
  'b2xVn2': { longURL: 'https://www.lighthouselabs.ca', userID: 'Chris' },
  '9sm5xK': { longURL: 'https://www.google.com', userID: 'Chris' }
};

let users = {
  'Chris': {
    id: 'Chris',
    email: 'chrischoi96@gmail.com',
    password: 'chrischoi96'
  }
}

// -------------------------------------------------------------------------------------------------------------

// ROUTE HANDLERS

// NEW URL PAGE

app.get('/urls/new', (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = {
      user: users[req.cookies["user_id"]],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]
    };
    res.render('urls_new', templateVars);
  } else {
    res.redirect("/login");
  }
});

// INDIVIDUAL URL PAGES

// checks if shortURL exists, and if not, redirects to main url page, and if so, redirects to the actual longURL page
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (req.params.shortURL === 'undefined') {
    res.redirect('/urls');
    return;
  } else {
    res.redirect(longURL);
  }
});

// Deletes shortURL & longURL from database based on shortURL
app.post('/urls/:shortURL/delete', (req, res) => {
  // Checks if the userID in database matches the cookie ID
  if (urlDatabase[req.params.shortURL].userID === req.cookies["user_id"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// Edits the longURL in database
app.post('/urls/:shortURL/edit', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.cookies["user_id"]) {
    urlDatabase[req.params.shortURL] = longUrlHasHTTP(req.body.longURL);
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.post('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.cookies["user_id"]) {
    res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    res.redirect('/login');
  }
});


app.get('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.cookies["user_id"]) {
    let templateVars = {
      user: users[req.cookies["user_id"]],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    res.render('urls_show', templateVars);
  } else {
    res.status(400).send('You are not allowed access to this url! Please login to the correct account.');
  }
});

// MAIN URL PAGE

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});


app.get('/urls', (req, res) => {
  console.log(req.cookies["user_id"]);
  let templateVars = {
    user: users[req.cookies["user_id"]],
    // req.cookies['user_id'] returns an array of one value
    urls: urlsForUser([req.cookies["user_id"]].toString()),
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
      user: users[req.cookies["user_id"]],
      urls: urlDatabase,
      errorMsg: true };
    res.render('urls_index', templateVars);
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = longUrlHasHTTP(req.body.longURL);
    res.redirect(`/urls/${shortURL}`);
  }
});

// REGISTERING

app.get('/register', (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
    errorMsg: false };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  let emptyField = false;

  if (email.length === 0 || password.length === 0) {
    emptyField = true;
  }

  if (emptyField) {
    res.status(400).send('One or both of the email or password fields is/are empty!');
  } else {
    if (checkEmail(email) !== -1) {
      res.status(400).send('The email is already in our database!');
    } else {
      users[id] = { id, email, password };
      res.cookie('user_id', id);
      res.redirect('/urls');
    }
  }
});

// LOGIN

app.get('/login', (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
    errorMsg: false };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  // User is either -1 (if not found in database), or user
  const user = checkEmail(email);
  if (user !== -1) {
    if (user.password === req.body.password) {
      res.cookie('user_id', user.id);
      res.redirect('/urls');
    } else {
      res.status(403).send("The password is not valid!");
    }
  } else {
    res.status(403).send("The email is not valid!");
  }
});

// LOGOUT

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// MAIN PAGE

app.get('/', (req, res) => {
  res.send('Hello!');
});

// -------------------------------------------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
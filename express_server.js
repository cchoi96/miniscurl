const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

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

let urlDatabase = {
  'b2xVn2': 'https://www.lighthouselabs.ca',
  '9sm5xK': 'https://www.google.com'
};

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (req.params.shortURL === 'undefined') {
    res.redirect('/urls');
    return;
  } else {
    res.redirect(longURL);
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  // console.log(req.params.shortURL);
  // console.log(urlDatabase);
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});


app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase, errorMsg: false };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  let urlExists = false;
  for (let key in urlDatabase) {
    if (req.body.longURL === urlDatabase[key]) {
      urlExists = true;
      break;
    }
  }
  if (urlExists) {
    let templateVars = { urls: urlDatabase, errorMsg: true };
    res.render('urls_index', templateVars);
  } else {
    const shortURL = generateRandomString();
    let regex = new RegExp('^https{0,1}://');
    if (!regex.test(req.body.longURL)) {
      req.body.longURL = `https://${req.body.longURL}`;
    }
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  }
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
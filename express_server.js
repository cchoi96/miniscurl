const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const dotenv = require('dotenv').config();
// -------------------------------------------------------------------------------------------------------------

// Routes
const individual = require('./routes/individual');
const urls = require('./routes/urls');
const register = require('./routes/register');
const login = require('./routes/login');
const logout = require('./routes/logout');
// -------------------------------------------------------------------------------------------------------------

const app = express();
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'user_id',
  keys: [ "id" ]
}));
app.use(methodOverride('_method'));

// DB Config
const db = require('./config/keys').mongoURI;

// Mongo
mongoose
  .connect(process.env.MONGODB_URI || db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.log(err));
// -------------------------------------------------------------------------------------------------------------

// Models
const Url = require('./models/Url');

// Individual URL Page
app.use('/individual', individual);

// URL Page
app.use('/urls', urls);

// Registering Page
app.use('/register', register);

// Login Page
app.use('/login', login);

// Logout Page
app.use('/logout', logout);

// Index Page
app.get('/', (req, res) => {
  Url
    .find({
      userID: req.session.user_id
    })
    .then(urlObj => {
      let templateVars = {
        user: urlObj.userID,
        urls: urlObj,
        errorMsg: false 
      };
      res.render('urls_home', templateVars);
    })
    .catch(err => {
      let templateVars = {
        user: ''
      };
      res.render('urls_home', templateVars);
    });
});
// -------------------------------------------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UrlSchema = new Schema({
  shortUrl: {
    type: String,
    required: true
  },
  longUrl: {
    type: String,
    required: true
  },
  userID: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// let urlDatabase = {
//   // 'b2xVn2': { longURL: 'https://www.lighthouselabs.ca', userID: 'Cd3fs3' },
//   // '9sm5xK': { longURL: 'https://www.google.com', userID: 'dsflk3' }
//   };

module.exports = Url = mongoose.model(`url`, UrlSchema);
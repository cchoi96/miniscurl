// 1. Generates the short URL, 6 characters long
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

// 2. Checks if user input longURL has https:// or http:// at beginning of string, and if not, adds it
const longUrlHasHTTP = longURL => {
  let regex = new RegExp('^https{0,1}://');
  return regex.test(longURL) ? longURL : `https://${longURL}`;
};

// 3. Checks if email exists in user database, returns user object if email exists
const checkEmail = (email, database) => {
  let keys = Object.keys(database);
  for (let key of keys) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return -1;
};

// 4. Returns URLs where userID === id of user currently logged in
const urlsForUser = (id, database) => {
  let personalUrls = {};
  let keys = Object.keys(database);
  for (let key of keys) {
    if (database[key].userID === id) {
      personalUrls[key] = database[key].longURL;
    }
  }
  return personalUrls;
};
// -------------------------------------------------------------------------------------------------------------

module.exports = {
  generateRandomString,
  longUrlHasHTTP,
  checkEmail,
  urlsForUser
};
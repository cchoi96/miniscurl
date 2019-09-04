const assert = require('chai').assert;
const helpers = require('../helpers.js');

describe('#generateRandomString', () => {
  it('should return a random 6-character long string', () => {
    const randomString = helpers.generateRandomString();
    assert.strictEqual(randomString.length, 6);
  }),
  it ('should be alphanumeric', () => {
    const regex = /^[a-z0-9]+$/i;
    const randomString = helpers.generateRandomString();
    const alphanumericCheck = regex.test(randomString);
    assert.isTrue(alphanumericCheck);
  });
});

describe('#longUrlHasHTTP', () => {
  it("should return the string 'https://' + string if string does not have 'https://' at the beginnning", () => {
    let string = 'google.com';
    let modifiedString = helpers.longUrlHasHTTP(string);
    assert.strictEqual(modifiedString, 'https://google.com');
  }),
  it("should return the original string if it has 'https://' at the beginning", () => {
    let string = 'https://google.com';
    let modifiedString = helpers.longUrlHasHTTP(string);
    assert.strictEqual(modifiedString, 'https://google.com');
  });
  // Some additional tests to make in the future is to check for data type
});

  // Some variables for the #checkEmail assertion
let database = {
  'Chris': {
    id: 'Chris',
    email: 'chris@gmail.com',
    password: 'chris'
  },
  'Jimmy': {
    id: 'Jimmy',
    email: 'jimmy@gmail.com',
    password: 'jimmy'
  }
};

let predictedUser = {
  id: 'Chris',
  email: 'chris@gmail.com',
  password: 'chris'
};

let filteredUser = helpers.checkEmail('chris@gmail.com', database);

describe('#checkEmail', () => {
  it('should return a filtered database with objects where object[key].email matches the input email', () => {
    assert.deepEqual(filteredUser, predictedUser);
  }),
  it('should return -1 when it cannot find an object where object[key].email matches the input email', () => {
    assert.strictEqual(helpers.checkEmail('hello@gmail.com', database), -1);
  });
});

  // Some variables for the #urlsForUser assertion
let urlDatabase = {
  'b2xVn2': { longURL: 'https://www.lighthouselabs.ca', userID: 'Cd3fs3' },
  '9sm5xK': { longURL: 'https://www.google.com', userID: 'dsflk3' }
};

let emptyDatabase = {};

let expectedDatabase = {
  '9sm5xK': 'https://www.google.com'
};

let filteredDatabase = helpers.urlsForUser('dsflk3', urlDatabase);

describe('#urlsForUser', () => {
  it('should return a filtered database of longURLs where the object[key].userID matches the provided id', () => {
    assert.deepEqual(filteredDatabase, expectedDatabase);
  }),
  it('should return an empty object if the object[key].userID cannot match with any object in the database', () => {
    assert.deepEqual(helpers.urlsForUser('dlkfjf', emptyDatabase), {});
  });
});
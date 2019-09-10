const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
})

// let users = {
//   // Example of what the user database looks like
//   // 'Chris': {
//   //   id: 'Chris',
//   //   email: 'chrischoi96@gmail.com',
//   //   password: 'chrischoi96'
//   // }
// };

module.exports = User = mongoose.model(`user`, UserSchema);
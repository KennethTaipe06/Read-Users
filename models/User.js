const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: String,
  username: String,
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  address: String,
  phone: String,
  semester: String,
  parallel: String,
  career: String,
  description: String,
  // image: {
  //   data: Buffer,
  //   contentType: String
  // }


});

module.exports = mongoose.model('User', userSchema);

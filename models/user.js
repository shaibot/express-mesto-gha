const mongoose = require('mongoose');

// Схема пользователя
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    required: true,
  },
});

// Модель пользователя
//const User = mongoose.model('user', userSchema);

//module.exports = User;

module.exports = mongoose.model('user', userSchema);
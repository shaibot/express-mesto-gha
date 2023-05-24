const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');
const { REGEX } = require('../utils/constants');
const Unauthorized = require('../Error/Unauthorized');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: ({ value }) => `${value} некорректный, попробуйте использовать другой email`,
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    validate: {
      validator: (v) => REGEX.test(v),
      message: 'Некорректная ссылка',
    },
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
}, { toJSON: { useProjection: true }, toObject: { useProjection: true } });

userSchema.statics.findUserByCredentials = async function findUserByCredentials(email, password) {
  try {
    const user = await this.findOne({ email }).select('+password');

    if (!user) {
      const error = new Unauthorized('Неправильные почта или пароль');
      throw error;
    }

    const matched = await bcrypt.compare(password, user.password);

    if (!matched) {
      const error = new Unauthorized('Неправильные почта или пароль');
      throw error;
    }

    return user;
  } catch (error) {
    // Обрабатываем ошибки здесь
    console.error(error);
    throw error; // Перебросим ошибку, чтобы она была обработана на уровне вызова
  }
};

module.exports = mongoose.model('user', userSchema);

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');

const REGEX = /(https?:\/\/)(www)?([a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=])*#?$/;

const userSchema = new mongoose.Schema({
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
      message: 'Указана некорректная ссылка',
    },
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: ({ value }) => `${value} не является действительным адресом электронной почты!`,
    },
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
}, { toJSON: { useProjection: true }, toObject: { useProjection: true } });

userSchema.statics.findUserByCredentials = function (email, password) {
  return this
    .findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильные почта или пароль'));
          }

          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);

// const mongoose = require('mongoose');
// const validator = require('validator');
// const bcrypt = require('bcryptjs');

// // Схема пользователя
// const userSchema = new mongoose.Schema(
//   {
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       validate: [validator.isEmail, 'Некорректный email'],
//     },
//     password: {
//       type: String,
//       required: true,
//       minlength: 8,
//       select: false,
//     },
//     name: {
//       type: String,
//       minlength: [2, 'Минимальная длина поля "name" - 2'],
//       maxlength: [30, 'Максимальная длина поля "name" - 30'],
//       default: 'Жак-Ив Кусто',
//     },
//     about: {
//       type: String,
//       minlength: [2, 'Минимальная длина поля "about" - 2'],
//       maxlength: [30, 'Максимальная длина поля "about" - 30'],
//       default: 'Исследователь',
//     },
//     avatar: {
//       type: String,
//       validate: {
//         validator: (v) => validator.isURL(v),
//         message: 'Некорректный URL',
//       },
//       default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
//     },
//   },
//   { versionKey: false },
// );

// userSchema.statics.findUserByCredentials = (email, password) => this.findOne({ email }).select('+password')
//   .then((user) => {
//     if (!user) {
//       return Promise.reject(new Error('Неправильные почта или пароль'));
//     }

//     return bcrypt.compare(password, user.password)
//       .then((matched) => {
//         if (!matched) {
//           return Promise.reject(new Error('Неправильные почта или пароль'));
//         }

//         return user;
//       });
//   });

// // Модель пользователя

// module.exports = mongoose.model('user', userSchema);

// const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const {
  NOT_FOUND_ERROR,
  // VALIDATION_ERROR,
  // handleError,
  // INTERNAL_SERVER_ERROR,
  ERROR_UNAUTHORIZED,
} = require('../errors/errors');
const User = require('../models/user');

const checkUser = (user, res) => {
  if (user) {
    return res.send({ data: user });
  }
  return res
    .status(NOT_FOUND_ERROR)
    .send({ message: 'Пользователь c таким _id не найден' });
};

const getUsersId = (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .then((user) => checkUser(user, res))
    .catch((error) => {
      next(error);
    });
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send(user))
    .catch(next);
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((user) => res.status(201).send(user))
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res
      .status(201)
      .send(user))

    .catch(next);
};

const updateUser = (req, res, updateData, next) => {
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  })
    .then((user) => checkUser(user, res))
    .catch(next);
};

const updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  updateUser(req, res, { name, about }, next);
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  updateUser(req, res, { avatar }, next);
};

// const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // ищем пользователя в базе данных по email и паролю
//     const user = await User.findUserByCredentials(email, password);

//     // создаем JWT
//     const token = jwt.sign({ _id: user._id }, 'your_secret_key', {
//       expiresIn: '7d',
//     });

//     // отправляем токен в httpOnly cookie
//     res.cookie('token', token, {
//       httpOnly: true,
//     });

//     // отправляем успешный ответ с токеном в заголовке
//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(401).json({ error: err.message });
//   }
// };

const login = (req, res) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res
        .cookie('token', token, {
          maxAge: 3600000,
          httpOnly: true,
          sameSite: true,
        })
        .send({ token });
    })
    .catch((err) => {
      res
        .status(ERROR_UNAUTHORIZED)
        .send({ message: err.message });
    });
};
// // Контроллер для получения информации о текущем пользователе
// const getCurrentUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(NOT_FOUND_ERROR).send({ message: 'Пользователь не найден' });
//     }
//     return res.status(200).send(user);
//   } catch (error) {
//     console.error(error);
//     return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка сервера' });
//   }
// };

module.exports = {
  createUser,
  getUsers,
  getUsersId,
  updateProfile,
  updateAvatar,
  login,
  getCurrentUser,
};

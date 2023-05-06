// const { body } = require('express-validator');
const {
  INTERNAL_SERVER_ERROR,
  NOT_FOUND_ERROR,
  VALIDATION_ERROR,
  handleError,
} = require('../errors/errors');
const User = require('../models/user');

const getUsersId = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).orFail(new Error('UserNotFound'));
    res.send(user);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(VALIDATION_ERROR).send({
        message: 'Некорректный запрос',
      });
    }
    if (err.message === 'UserNotFound') {
      return res.status(NOT_FOUND_ERROR).send({
        message: 'Пользователь не найден',
      });
    }
    handleError(err, res);
  }
  return undefined;
};

const getUsers = (req, res) => {
  User.find({})
    .orFail(() => new Error('No users found'))
    .then((users) => res.status(200).send({ data: users }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(VALIDATION_ERROR).send({
          message: 'Некорректный запрос',
        });
      }
      return handleError(err, res);
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .orFail(new Error('RecordNotFound'))
    .then((user) => res.status(201).send(user))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(VALIDATION_ERROR).send({
          message: 'Переданы некорректные данные при обновлении профиля',
        });
      }
      if (error.message === 'RecordNotFound') {
        return res.status(NOT_FOUND_ERROR).send({
          message: 'Пользователь не найден',
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({
        message: 'На сервере произошла ошибка',
      });
    });
};

const updateProfile = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  return User.findByIdAndUpdate(
    userId,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail(() => new Error('NotFound'))
    .then((user) => {
      if (user) {
        return res.status(200).send({ data: user });
      }
      return res.status(NOT_FOUND_ERROR).send({
        message: `Пользователь с указанным _id не найден ${NOT_FOUND_ERROR}`,
      });
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(VALIDATION_ERROR).send({
          message: `Переданы некорректные данные при обновлении профиля ${VALIDATION_ERROR}`,
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({
        message: `На сервере произошла ошибка ${INTERNAL_SERVER_ERROR}`,
      });
    });
};

// const updateProfile = [
// // middleware для проверки полей name, about
// body('name')
// .isLength({ min: 2, max: 30 })
// .withMessage('Имя должно быть от 2 до 30 символов'),
// body('about')
// .isLength({ min: 2, max: 30 })
// .withMessage('Описание должно быть от 2 до 30 символов'),
// // middleware для валидации входных данных
// (req, res) => {
// // достаем из тела запроса поля name и about
// const { name, about } = req.body;
// // достаем ID пользователя
// if (req.user && req.user._id) {
//   const userId = req.user._id;
//   // продолжайте работу с userId
// } else {
//   console.log('не нашел пользователя')
// };
//   User.findByIdAndUpdate(
//     userId,
//     { name, about},
//     // Передадим объект опций:
//     {
//         new: true, // обработчик then получит на вход обновлённую запись
//         runValidators: true, // данные будут валидированы перед изменением
//         upsert: true // если пользователь не найден, он будет создан
//     }
// )
//   .then(user => res.send({ data: user }))
//   .catch(err => res.status(500).send({
//  message: "Данные не прошли валидацию. Либо произошло что-то совсем немыслимое" }));
// }
// ]

const updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(NOT_FOUND_ERROR).send({ message: 'Пользователь не найден' });
    }
    user.avatar = req.body.avatar;
    await user.save();

    res.send({ message: 'Аватар обновлен' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(VALIDATION_ERROR).send({ message: 'Переданы некорректные данные при обновлении аватара' });
    }

    res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка сервера' });
  }
  return undefined;
};

module.exports = {
  createUser,
  getUsers,
  getUsersId,
  updateProfile,
  updateAvatar,
};

// /////////////////////////////////////////////////
// module.exports.createUser = (req, res) => {
//   const { name, about, avatar } = req.body;
//   User.create({ name, about, avatar })
//     .then((user) => res.status(CODE_CREATED).send(user))
//     .catch((err) => handleError(err, res));
// };

// module.exports.getUsers = (req, res) => {
//   User.find({})
//     .then((user) => res.status(CODE).send({ data: user }))
//     .catch((err) => handleError(err, res));
// };

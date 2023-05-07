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

  if (!name || name.length < 2 || name.length > 30) {
    return res.status(VALIDATION_ERROR).send({ message: 'Переданы некорректные данные при создании пользователя' });
  }

  if (!about || about.length < 2 || about.length > 30) {
    return res.status(VALIDATION_ERROR).send({ message: 'Переданы некорректные данные при создании пользователя' });
  }

  if (!avatar) {
    return res.status(VALIDATION_ERROR).send({ message: 'Переданы некорректные данные при создании пользователя' });
  }

  User.create({ name, about, avatar })
    .then((user) => res.status(201).send({
      data: {
        _id: user._id,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
      },
    }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(VALIDATION_ERROR).send({
          message: 'Переданы некорректные данные при создании пользователя',
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({
        message: 'На сервере произошла ошибка',
      });
    });
  return undefined;
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

const updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(NOT_FOUND_ERROR).send({ message: 'Пользователь не найден' });
    }
    user.avatar = req.body.avatar;
    await user.save();

    // Возвращаем в ответе url-адрес аватара, который был передан в запросе
    res.send({ message: 'Аватар обновлен', avatar: req.body.avatar });
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

const { default: mongoose } = require('mongoose');
const {
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
  return null;
};

const getUsers = (req, res) => {
  User.find({})
    .orFail(() => new Error('Пользователь не найден'))
    .then((users) => res.status(200).send(users))
    .catch((err) => handleError(err, res));
};

const createUser = async (req, res) => {
  try {
    const { name, about, avatar } = req.body;
    if (!name || !about || !avatar
        || name.length < 2 || name.length > 30
        || about.length < 2 || about.length > 30) {
      return res.status(VALIDATION_ERROR).send({ message: 'Переданы некорректные данные при создании пользователя' });
    }

    const user = await User.create({ name, about, avatar });
    return res.status(201).send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(VALIDATION_ERROR).send({
        message: 'Переданы некорректные данные при создании пользователя',
      });
    }
    return handleError(err, res);
  }
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
    .then((user) => res.status(200).send(user))
    .catch((error) => {
      if (error instanceof mongoose.CastError) {
        return res.status(NOT_FOUND_ERROR).send({ message: 'Некорректный ID пользователя' });
      }
      if (error.message === 'NotFound') { // Здесь указываем текст, который мы указали в блоке orFail
        return res.status(NOT_FOUND_ERROR).send({
          message: `Пользователь с указанным _id не найден ${NOT_FOUND_ERROR}`,
        });
      }
      if (error.name === 'ValidationError') {
        return res.status(VALIDATION_ERROR).send({
          message: `Переданы некорректные данные при обновлении профиля ${VALIDATION_ERROR}`,
        });
      }
      return handleError(error, res);
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
    if (err instanceof mongoose.CastError) {
      return res.status(NOT_FOUND_ERROR).send({ message: 'Некорректный ID пользователя' });
    }
    if (err.name === 'ValidationError') {
      return res.status(VALIDATION_ERROR).send({ message: 'Переданы некорректные данные при обновлении аватара' });
    }

    handleError(err, res);
  }
  return null;
};

module.exports = {
  createUser,
  getUsers,
  getUsersId,
  updateProfile,
  updateAvatar,
};

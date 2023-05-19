const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;

const User = require('../models/user');
const {
  CODE,
  CODE_CREATED,
  ERROR_NOT_FOUND,
  ERROR_UNAUTHORIZED,
} = require('../utils/constants');

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
      .status(CODE_CREATED)
      .send({ data: user }))

    .catch(next);
};

const checkUser = (user, res) => {
  if (user) {
    return res.send({ data: user });
  }
  return res
    .status(ERROR_NOT_FOUND)
    .send({ message: 'Пользователь по указанному _id не найден' });
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((user) => res.status(CODE).send(user))
    .catch(next);
};

const getUserById = (req, res, next) => {
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

module.exports = {
  createUser,
  getUsers,
  getUserById,
  getCurrentUser,
  updateProfile,
  updateAvatar,
  login,
};

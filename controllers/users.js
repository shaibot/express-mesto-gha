const { INTERNAL_SERVER_ERROR, NOT_FOUND_ERROR, VALIDATION_ERROR } = require("../errors");
const User = require("../models/user");
const { body } = require("express-validator");

const handleError = (err, res) => {
  res.status(500).send({ message: "Произошла ошибка" });
};

const getUsersId = (req, res) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => handleError(err, res));
};

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch((err) => {
      console.error(err);
      handleError(err, res);
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      console.error(err);
      handleError(err, res);
    });
};

const updateProfile = (req, res) => {
  console.log(req.user)
  const { name, about } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate({ name, about }, userId, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (user) {
        return res.send(user);
      }
      return res.status(NOT_FOUND_ERROR).send({
        message: `Пользователь с указанным _id не найден ${NOT_FOUND_ERROR}`,
      });
    })
    .catch((error) => {
      if (error.name === "ValidationError") {
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
//   .catch(err => res.status(500).send({ message: "Данные не прошли валидацию. Либо произошло что-то совсем немыслимое" }));
// }
// ]

const updateAvatar = () => {
  console.log("updateAvatar");
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

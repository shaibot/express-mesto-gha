const { ValidationError, CastError, DocumentNotFoundError } = require('mongoose').Error;
const ErrorNotFound = require('../errors/ErrorNotFound');
const Forbidden = require('../errors/Forbidden');
const Unauthorized = require('../errors/Unauthorized');
const {
  VALIDATION_ERROR, NOT_FOUND_ERROR, ERROR_CONFLICT, INTERNAL_SERVER_ERROR,
} = require('../errors/errors');

module.exports = (err, req, res, next) => {
  if (err instanceof CastError || err instanceof ValidationError) {
    return res
      .status(VALIDATION_ERROR)
      .send({ message: `Переданы некорректные данные ${VALIDATION_ERROR}` });
  }

  if (err instanceof DocumentNotFoundError) {
    return res
      .status(NOT_FOUND_ERROR)
      .send({
        message: `Пользователь с указанным _id не найден ${NOT_FOUND_ERROR}`,
      });
  }

  if (err instanceof ErrorNotFound || err instanceof Unauthorized || err instanceof Forbidden) {
    const { message } = err;
    return res
      .status(err.type)
      .send({ message });
  }

  if (err.code === 11000) {
    return res
      .status(ERROR_CONFLICT)
      .send({ message: 'Адрес электронной почты уже зарегистрирован' });
  }

  res
    .status(INTERNAL_SERVER_ERROR)
    .send({
      message: 'На сервере произошла ошибка',
    });

  return next();
};

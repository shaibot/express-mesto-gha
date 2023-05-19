const NotFoundError = require('../Error/NotFoundError');

module.exports.errorNotFound = (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
};

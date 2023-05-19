const NOT_FOUND_ERROR = 404;
const VALIDATION_ERROR = 400;
const INTERNAL_SERVER_ERROR = 500;
const handleError = (err, res) => {
  res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка сервера' });
};
const errorNotFound = (req, res) => {
  res
    .status(NOT_FOUND_ERROR)
    .send({ message: 'Cтраница не найдена' });
};
const ERROR_UNAUTHORIZED = 401;
const ERROR_FORBIDDEN = 403;
const ERROR_CONFLICT = 409;

module.exports = {
  NOT_FOUND_ERROR,
  VALIDATION_ERROR,
  INTERNAL_SERVER_ERROR,
  handleError,
  errorNotFound,
  ERROR_UNAUTHORIZED,
  ERROR_FORBIDDEN,
  ERROR_CONFLICT,
};

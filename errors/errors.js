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

module.exports = {
  NOT_FOUND_ERROR,
  VALIDATION_ERROR,
  INTERNAL_SERVER_ERROR,
  handleError,
  errorNotFound,
};

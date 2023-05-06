const NOT_FOUND_ERROR = 404;
const VALIDATION_ERROR = 400;
const INTERNAL_SERVER_ERROR = 500;
const handleError = (err, res) => {
  res.status(INTERNAL_SERVER_ERROR).send({ message: 'server error' });
};
const UNAUTHORIZED_ERROR = 401;
const CONFLICT_ERROR = 409;
const FORBIDDEN_ERROR = 403;

module.exports = {
  NOT_FOUND_ERROR,
  VALIDATION_ERROR,
  INTERNAL_SERVER_ERROR,
  handleError,
  UNAUTHORIZED_ERROR,
  CONFLICT_ERROR,
  FORBIDDEN_ERROR,
};

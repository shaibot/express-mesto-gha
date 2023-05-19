const { NOT_FOUND_ERROR } = require('./errors');

class ErrorNotFound extends Error {
  constructor(message) {
    super(message);
    this.type = NOT_FOUND_ERROR;
  }
}

module.exports = ErrorNotFound;

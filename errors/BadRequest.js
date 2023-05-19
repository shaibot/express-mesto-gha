const { VALIDATION_ERROR } = require('./errors');

class BadRequest extends Error {
  constructor(message) {
    super(message);
    this.type = VALIDATION_ERROR;
  }
}

module.exports = BadRequest;

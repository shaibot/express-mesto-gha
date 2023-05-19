const { ERROR_INTERNAL_SERVER } = require('../utils/constants');

class InternalServerError extends Error {
  constructor(message) {
    super(message);
    this.type = ERROR_INTERNAL_SERVER;
  }
}

module.exports = InternalServerError;

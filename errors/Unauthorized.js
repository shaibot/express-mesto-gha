const { ERROR_UNAUTHORIZED } = require('./errors');

class Unauthorized extends Error {
  constructor(message) {
    super(message);
    this.type = ERROR_UNAUTHORIZED;
  }
}

module.exports = Unauthorized;

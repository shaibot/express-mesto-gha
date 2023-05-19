const { ERROR_FORBIDDEN } = require('./errors');

class Forbidden extends Error {
  constructor(message) {
    super(message);
    this.type = ERROR_FORBIDDEN;
  }
}

module.exports = Forbidden;

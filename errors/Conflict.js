const { ERROR_CONFLICT } = require('./errors');

class Conflict extends Error {
  constructor(message) {
    super(message);
    this.type = ERROR_CONFLICT;
  }
}

module.exports = Conflict;

const { INTERNAL_SERVER_ERROR } = require('./errors');

class InternalServer extends Error {
  constructor(message) {
    super(message);
    this.type = INTERNAL_SERVER_ERROR;
  }
}

module.exports = InternalServer;

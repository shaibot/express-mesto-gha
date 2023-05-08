const errorNotFoundRouter = require('express').Router();
const { errorNotFound } = require('../errors/errors');

errorNotFoundRouter.all('/*', errorNotFound);

module.exports = errorNotFoundRouter;

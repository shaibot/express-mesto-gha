const router = require('express').Router();

const cardsRouter = require('./cards');
const errorNotFoundRouter = require('./notFoundError');

const usersRouter = require('./users');

router.use('/users', usersRouter);
router.use('/cards', cardsRouter);
router.use('*', errorNotFoundRouter);

module.exports = router;

const router = require('express').Router();
const signinRouter = require('./signin');
const signupRouter = require('./signup');

const cardsRouter = require('./cards');
const usersRouter = require('./users');
const auth = require('../middlewares/auth');
const NotFoundError = require('../Error/NotFoundError');

router.use('/', signinRouter);
router.use('/', signupRouter);

router.use(auth); // роуты ниже будут защищены

router.use('/users', usersRouter);
router.use('/cards', cardsRouter);
router.use('*', (req, res, next) => {
  next(new NotFoundError('Cтраница не найдена'));
});

module.exports = router;

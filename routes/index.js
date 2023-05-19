const router = require('express').Router();

const { login, createUser } = require('../controllers/users');
const auth = require('../middlewares/auth');
const cardsRouter = require('./cards');
const errorNotFoundRouter = require('./notFoundError');

const usersRouter = require('./users');

router.post('/signin', login);
router.post('/signup', createUser);
router.use(auth); // все роуты ниже этой строки будут защищены
router.use('/users', usersRouter);
router.use('/cards', cardsRouter);
router.use('*', errorNotFoundRouter);

module.exports = router;

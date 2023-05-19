const usersRouter = require('express').Router();

const {
  getUsers,
  getUsersId,
  updateProfile,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');

usersRouter.get('/', getUsers);
usersRouter.get('/:userId', getUsersId);
usersRouter.get('/me', getCurrentUser);

usersRouter.patch('/me', updateProfile); // обновляет профиль
usersRouter.patch('/me/avatar', updateAvatar); // обновляет аватар

module.exports = usersRouter;

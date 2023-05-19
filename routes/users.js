const usersRouter = require('express').Router();

const {
  getUsers,
  getCurrentUser,
  getUserById,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');
const { validateUserId, validateUpdateProfile, validateUpdateAvatar } = require('../middlewares/userValidator');

usersRouter.get('/', getUsers);
usersRouter.get('/me', getCurrentUser);
usersRouter.get('/:userId', validateUserId, getUserById);
usersRouter.patch('/me', validateUpdateProfile, updateProfile);
usersRouter.patch('/me/avatar', validateUpdateAvatar, updateAvatar);

module.exports = usersRouter;

const { Joi, celebrate } = require('celebrate');
const { REGEX } = require('../utils/constants');

const validateSignin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

const validateSignup = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(REGEX),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});
const validateUserId = celebrate({
  params: Joi.object().keys({ userId: Joi.string().length(24).required().hex() }),
});

const validateUpdateProfile = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
});

const validateUpdateAvatar = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(REGEX),
  }),
});

module.exports = {
  validateSignin,
  validateSignup,
  validateUserId,
  validateUpdateProfile,
  validateUpdateAvatar,
};

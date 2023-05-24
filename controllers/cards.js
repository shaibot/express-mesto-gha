const { DocumentNotFoundError } = require('mongoose').Error;
const BadRequest = require('../Error/BadRequest');
const Forbidden = require('../Error/Forbidden');
const NotFoundError = require('../Error/NotFoundError');
const Card = require('../models/card');
const {
  CODE,
  CODE_CREATED,
  ERROR_NOT_FOUND,
} = require('../utils/constants');

const checkCard = (card, res, next) => {
  if (card) {
    return res.send({ data: card });
  }
  const error = new NotFoundError(`Карточка с указанным _id не найдена ${ERROR_NOT_FOUND}`);
  return next(error);
};

const getCards = (req, res, next) => {
  Card.find({})
    .populate([
      { path: 'owner', model: 'user' },
      { path: 'likes', model: 'user' },
    ])
    .then((card) => {
      res.status(CODE).send({ data: card });
    })
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user;
  Card.create({ name, link, owner })
    .then((card) => card.populate('owner'))
    .then((card) => res.status(CODE_CREATED).send({ data: card }))
    .catch(next);
};

const deleteCard = async (req, res, next) => {
  const _id = req.params.cardId;

  try {
    const card = await Card.findOne({ _id }).populate([{ path: 'owner', model: 'user' }]);
    if (!card) {
      throw new NotFoundError('Карточка была удалена');
    }
    if (card.owner._id.toString() !== req.user._id.toString()) {
      throw new Forbidden('Вы не можете удалить карточку другого пользователя');
    }

    const result = await Card.deleteOne({ _id });
    if (result.deletedCount === 0) {
      throw new BadRequest('Не удалось удалить карточку');
    }

    res.send({ data: card });
  } catch (error) {
    next(error);
  }
};

const updateLikes = (req, res, updateData, next) => {
  Card.findByIdAndUpdate(req.params.cardId, updateData, { new: true })
    .populate([
      { path: 'owner', model: 'user' },
      { path: 'likes', model: 'user' },
    ])
    .then((card) => {
      if (!card) {
        throw new DocumentNotFoundError('Карточка не найдена');
      }
      checkCard(card, res);
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  const owner = req.user._id;
  const newData = { $addToSet: { likes: owner } };
  updateLikes(req, res, newData, next);
};

const dislikeCard = (req, res, next) => {
  const owner = req.user._id;
  const newData = { $pull: { likes: owner } };
  updateLikes(req, res, newData, next);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};

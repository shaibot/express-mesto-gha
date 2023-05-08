// импортируем модель карточки из нашей схемы
const { default: mongoose } = require('mongoose');
const {
  handleError,
  VALIDATION_ERROR,
  NOT_FOUND_ERROR,
} = require('../errors/errors');
const Card = require('../models/card');

const getAllCards = async (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const page = req.query.page || 1;
    const skip = (page - 1) * limit;
    const cards = await Card.find({})
      .skip(skip)
      .limit(limit)
      .populate([
        { path: 'owner' },
        { path: 'likes' },
      ]);
    if (cards.length === 0 && page !== 1) {
      throw new Error('Страница не найдена');
    }
    if (!cards || cards.length === 0) {
      return res
        .status(VALIDATION_ERROR)
        .send({ message: 'Список карточек не найден' });
    }
    res.status(200).send({
      cards,
    });
  } catch (error) {
    handleError(error, res);
  }
  return null;
};

const createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    if (!name || name.length < 2 || name.length > 30) {
      return res.status(VALIDATION_ERROR).send({
        message: 'Переданы некорректные данные при создании пользователя',
      });
    }
    if (!name || !link) {
      return res
        .status(VALIDATION_ERROR)
        .send({ message: 'Поля "name" и "link" обязательно нужно заполнить' });
    }

    if (!req.user || !req.user._id) {
      return res
        .status(VALIDATION_ERROR)
        .send({ message: 'Войдите, чтобы редактировать карточку' });
    }

    const cardData = { ...req.body, owner: req.user };
    const card = await Card.create(cardData);
    const createdCard = await Card.findById(card._id).populate('owner');
    return res.status(201).send(createdCard);
  } catch (err) {
    if (err.codeName === 'DuplicateKey') {
      return res
        .status(VALIDATION_ERROR)
        .send({ message: 'Карточка с таким именем уже существует' });
    }
    handleError(err, res);
  }
  return null;
};

const deleteCards = async (req, res) => {
  try {
    // Деструктуризация для получения параметров запроса
    const { cardId } = req.params;
    const userId = req.user._id;

    // Проверяем валидность ID карточки
    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      return res
        .status(VALIDATION_ERROR)
        .send({ message: 'Некорректный ID карточки' });
    }

    // Проверяем наличие карточки с данным ID
    const card = await Card.findById(cardId);
    if (!card) {
      return res
        .status(NOT_FOUND_ERROR)
        .send({ message: 'Карточка не найдена' });
    }

    // Проверяем, что текущий пользователь является владелецем карточки
    if (card.owner.toString() !== userId) {
      return res
        .status(VALIDATION_ERROR)
        .send({ message: 'У вас нет прав на удаление этой карточки' });
    }

    // Удаляем карточку
    const deletedCard = await Card.findByIdAndRemove(cardId);

    // Отправляем удаленную карточку обратно на клиент
    return res.send(deletedCard);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(VALIDATION_ERROR).send({
        message: 'Некорректный запрос',
      });
    }
    // Отправляем ошибку обратно на клиент
    handleError(err, res);
  }

  // Гарантируем возврат значения
  return null;
};

const putLikeCard = (req, res, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.cardId)) {
    return res.status(400).send({
      message: 'Некорректный ID карточки',
    });
  }

  Card.findByIdAndUpdate(req.params.cardId, updateData, { new: true })
    .populate([
      { path: 'owner', model: 'user' },
      { path: 'likes', model: 'user' },
    ])
    .then((card) => {
      if (!card) {
        return res
          .status(NOT_FOUND_ERROR)
          .send({
            message: `Карточка с указанным _id не найдена ${NOT_FOUND_ERROR}`,
          });
      }
      return res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(VALIDATION_ERROR).send({
          message: 'Некорректный запрос',
        });
      }
      // Отправляем ошибку обратно на клиент
      return handleError(err, res);
    });
  return null;
};

const likeCard = (req, res) => {
  const owner = req.user._id;
  const newData = { $addToSet: { likes: owner } };
  putLikeCard(req, res, newData);
};

const dislikeCard = (req, res) => {
  const owner = req.user._id;
  const newData = { $pull: { likes: owner } };
  putLikeCard(req, res, newData);
};

module.exports = {
  getAllCards,
  createCard,
  deleteCards,
  likeCard,
  dislikeCard,
};

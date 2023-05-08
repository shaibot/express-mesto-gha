// импортируем модель карточки из нашей схемы
const { default: mongoose } = require('mongoose');
const {
  handleError,
  INTERNAL_SERVER_ERROR,
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
        { path: 'owner', model: 'user' },
        { path: 'likes', model: 'user' },
      ]);
    if (cards.length === 0 && page !== 1) {
      throw new Error('Page not found');
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
  return undefined;
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
        .send({ message: 'Name and link are required' });
    }

    if (!req.user || !req.user._id) {
      return res
        .status(VALIDATION_ERROR)
        .send({ message: 'You must be logged in to create a card' });
    }

    const cardData = { ...req.body, owner: req.user };
    const card = await Card.create(cardData);
    const createdCard = await Card.findById(card._id).populate('owner');
    return res.status(201).send(createdCard);
  } catch (err) {
    if (err.codeName === 'DuplicateKey') {
      return res
        .status(VALIDATION_ERROR)
        .send({ message: 'A card with the same name already exists' });
    }
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: 'An error occurred while processing your request' });
  }
};

// const deleteCards = (req, res) => {
//   Card.findByIdAndDelete(req.params.cardId)
//     .populate([{ path: 'owner', model: 'user' }])
//     .then(() => res.send({ message: 'Карточка была удалена' }))
//     .catch((err) => handleError(err, res));
// };

// // обработчик DELETE-запроса на удаление карточки по ID
// const deleteCardById = (req, res) => {
//   // достаем из параметров запроса ID карточки
//   const { cardId } = req.params;

//   // вызываем метод findByIdAndRemove и передаем ему ID карточки
//   Card.findByIdAndRemove(cardId)
//     .then((deletedCard) => {
//       // отправляем удаленную карточку обратно на клиент
//       res.send(deletedCard);
//     })
//     .catch((err) => {
//       // отправляем ошибку обратно на клиент
//       handleError(err, res);
//     });
// };

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
    // Отправляем ошибку обратно на клиент
    handleError(err, res);
  }

  // Гарантируем возврат значения
  return null;
};

// const deleteCards = (req, res) => {
//   Card.findByIdAndDelete(req.params.cardId)
//     .populate([
//       { path: 'owner', model: 'user' },
//     ])
//     .then(() => res.send({ message: 'Карточка была удалена' }))
//     .catch((err) => handleError(err, res));
// };

// const likeCard = (req) => {
//   Card.findByIdAndUpdate(
//     req.params.cardId,
//     { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
//     { new: true },
//   );
// };

// const likeCard = async (req) => {
//   try {
//     const card = await Card.findByIdAndUpdate(
//       req.params.cardId,
//       { $addToSet: { likes: req.user._id } },
//       { new: true },
//     );
//     // console.log(card);
//     return card;
//   } catch (err) {
//     // console.error(err);
//     throw new Error('Failed to update card');
//   }
// };

// const dislikeCard = (req) => {
//   Card.findByIdAndUpdate(
//     req.params.cardId,
//     { $pull: { likes: req.user._id } }, // убрать _id из массива
//     { new: true },
//   );
// };

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
      return res.status(200).send({ data: card });
    })
    .catch((err) => handleError(err, res));
  return undefined;
};

const likeCard = (req, res) => {
  const owner = req.user._id;
  const newData = { $addToSet: { likes: owner } };
  putLikeCard(req, res, newData);
};

// const checkCardId = (card, res) => {
//   if (card) {
//     return res.status(200).send({ data: card });
//   }
//   return res
//     .status(NOT_FOUND_ERROR)
//     .send({ message: `Карточка с таким _id не найдена ${NOT_FOUND_ERROR}` });
// };

// const updateLikes = (req, res, updateData) => {
//   Card.findByIdAndUpdate(req.params.cardId, updateData, { new: true })
//     .populate([
//       { path: 'owner', model: 'user' },
//       { path: 'likes', model: 'user' },
//     ])
//     .then((user) => checkCardId(user, res))
//     .catch((err) => handleError(err, res));
// };

// const likeCard = (req, res) => {
//   const owner = req.user._id;
//   const newData = { $addToSet: { likes: owner } };
//   updateLikes(req, res, newData);
// };

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

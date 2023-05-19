// импортируем модель карточки из нашей схемы
// const { default: mongoose } = require('mongoose');
const {
  NOT_FOUND_ERROR,
} = require('../errors/errors');
const Card = require('../models/card');
const ErrorNotFound = require('../errors/ErrorNotFound');
const Forbidden = require('../errors/Forbidden');

const getAllCards = (req, res, next) => {
  Card.find({})
    .populate([
      { path: 'owner', model: 'user' },
      { path: 'likes', model: 'user' },
    ])
    .then((card) => {
      res.status(201).send(card);
    })
    .catch(next);
};

const checkCard = (card, res) => {
  if (card) {
    return res.send({ data: card });
  }
  return res
    .status(NOT_FOUND_ERROR)
    .send({ message: `Карточка с таким _id не найдена ${NOT_FOUND_ERROR}` });
};
// const getAllCards = async (req, res) => {
//   try {
//     const limit = req.query.limit || 100;
//     const page = req.query.page || 1;
//     const skip = (page - 1) * limit;
//     const cards = await Card.find({})
//       .skip(skip)
//       .limit(limit)
//       .populate([
//         { path: 'owner' },
//         { path: 'likes' },
//       ]);
//     if (cards.length === 0 && page !== 1) {
//       throw new Error('Страница не найдена');
//     }
//     if (!cards || cards.length === 0) {
//       return res
//         .status(VALIDATION_ERROR)
//         .send({ message: 'Список карточек не найден' });
//     }
//     res.status(200).send({
//       cards,
//     });
//   } catch (error) {
//     handleError(error, res);
//   }
//   return null;
// };

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user;
  Card.create({ name, link, owner })
    .then((card) => card.populate('owner'))
    .then((card) => res.status(201).send(card))
    .catch(next);
};

const deleteCards = (req, res, next) => {
  const _id = req.params.cardId;

  Card.findOne({ _id })
    .populate([
      { path: 'owner', model: 'user' },
    ])
    .then((card) => {
      if (!card) {
        throw new ErrorNotFound('Карточка была удалена');
      }
      if (card.owner._id.toString() !== req.user._id.toString()) {
        throw new Forbidden('Вы не можете удалить не свою карточку');
      }
      Card.findByIdAndDelete({ _id })
        .populate([
          { path: 'owner', model: 'user' },
        ])
        .then((cardDeleted) => {
          res.send({ data: cardDeleted });
        });
    })
    .catch(next);
};

// const putLikeCard = (req, res, updateData) => {
//   if (!mongoose.Types.ObjectId.isValid(req.params.cardId)) {
//     return res.status(400).send({
//       message: 'Некорректный ID карточки',
//     });
//   }

//   Card.findByIdAndUpdate(req.params.cardId, updateData, { new: true })
//     .populate([
//       { path: 'owner', model: 'user' },
//       { path: 'likes', model: 'user' },
//     ])
//     .then((card) => {
//       if (!card) {
//         return res
//           .status(NOT_FOUND_ERROR)
//           .send({
//             message: `Карточка с указанным _id не найдена ${NOT_FOUND_ERROR}`,
//           });
//       }
//       return res.status(200).send(card);
//     })
//     .catch((err) => {
//       if (err.name === 'CastError') {
//         return res.status(VALIDATION_ERROR).send({
//           message: 'Некорректный запрос',
//         });
//       }
//       // Отправляем ошибку обратно на клиент
//       return handleError(err, res);
//     });
//   return null;
// };

// const likeCard = (req, res) => {
//   const owner = req.user._id;
//   const newData = { $addToSet: { likes: owner } };
//   putLikeCard(req, res, newData);
// };

// const dislikeCard = (req, res) => {
//   const owner = req.user._id;
//   const newData = { $pull: { likes: owner } };
//   putLikeCard(req, res, newData);
// };

const updateLikes = (req, res, updateData, next) => {
  Card.findByIdAndUpdate(req.params.cardId, updateData, { new: true })
    .populate([
      { path: 'owner', model: 'user' },
      { path: 'likes', model: 'user' },
    ])
    .then((user) => checkCard(user, res))
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
  getAllCards,
  createCard,
  deleteCards,
  likeCard,
  dislikeCard,
};

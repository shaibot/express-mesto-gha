// импортируем модель карточки из нашей схемы
const {
  handleError,
  NOT_FOUND_ERROR,
  UNAUTHORIZED_ERROR,
  CONFLICT_ERROR,
  FORBIDDEN_ERROR,
} = require('../errors/errors');
const Card = require('../models/card');

// const bodyParser = require("body-parser");

// обработчик GET-запроса на получение списка всех карточек
// const getAllCards = (req, res) => {
//   // вызываем метод find без параметров и получаем все карточки из базы данных
//   Card.find({})
//     .then((cards) => {
//       // отправляем список карточек обратно на клиент
//       res.send(cards);
//     })
//     .catch((err) => {
//       // отправляем ошибку обратно на клиент
//       handleError(err, res);
//     });
// };

const getAllCards = async (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const page = req.query.page || 1;
    const skip = (page - 1) * limit;
    const count = await Card.countDocuments();
    const cards = await Card.find({}).skip(skip).limit(limit);
    if (cards.length === 0 && page !== 1) {
      throw new Error('Page not found');
    }
    res.status(200).send({
      count,
      cards,
      currentPage: page,
      pageCount: Math.ceil(count / limit),
    });
  } catch (error) {
    handleError(error, res);
  }
};

// // обработчик POST-запроса на создание новой карточки
// const createCard = (req, res) => {
//   // достаем из тела запроса поля name и link
//   const { name, link } = req.body;
//   console.log(req.body);
//   // создаем новый экземпляр карточки на основе модели
//   const card = new Card({ name, link });

//   // сохраняем новую карточку в базу данных
//   card
//     .save()
//     .then((createdCard) => {
//       // отправляем созданную карточку обратно на клиент
//       res.send(createdCard);
//     })
//     .catch((err) => {
//       // отправляем ошибку обратно на клиент
//       handleError(err, res);
//     });
// };

const createCard = async (req, res) => {
  try {
    const { name, link } = req.body;

    if (!name || !link) {
      return res
        .status(NOT_FOUND_ERROR)
        .send({ message: 'Name and link are required' });
    }

    if (!req.user || !req.user._id) {
      return res
        .status(UNAUTHORIZED_ERROR)
        .send({ message: 'You must be logged in to create a card' });
    }

    const cardData = { ...req.body, owner: req.user._id };
    const card = await Card.create(cardData);
    const createdCard = await Card.findById(card._id).lean();
    return res.status(201).send(createdCard); // add return statement here
  } catch (err) {
    console.error(`${err.name}: ${err.message}`);
    if (err.codeName === 'DuplicateKey') {
      return res
        .status(CONFLICT_ERROR)
        .send({ message: 'A card with the same name already exists' });
    }
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: 'An error occurred while processing your request' });
  }
};

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

const deleteCardById = async (req, res) => {
  try {
    // Деструктуризация для получения параметров запроса
    const { cardId } = req.params;
    const userId = req.user._id;

    // Проверяем наличие карточки с данным ID
    const card = await Card.findById(cardId).exec();
    if (!card) {
      return res.status(NOT_FOUND_ERROR).send({ message: 'Карточка не найдена' });
    }

    // Проверяем, что текущий пользователь является владелецем карточки
    if (card.owner.toString() !== userId) {
      return res
        .status(FORBIDDEN_ERROR)
        .send({ message: 'У вас нет прав на удаление этой карточки' });
    }

    // Удаляем карточку
    const deletedCard = await Card.findByIdAndRemove(cardId).exec();

    // Отправляем удаленную карточку обратно на клиент
    return res.send(deletedCard);
  } catch (err) {
    // Отправляем ошибку обратно на клиент
    handleError(err, res);
  }

  // Гарантируем возврат значения
  return null;
};

// const likeCard = (req) => {
//   Card.findByIdAndUpdate(
//     req.params.cardId,
//     { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
//     { new: true },
//   );
// };

const likeCard = async (req) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    console.log(card);
    return card;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to update card');
  }
};

// const dislikeCard = (req) => {
//   Card.findByIdAndUpdate(
//     req.params.cardId,
//     { $pull: { likes: req.user._id } }, // убрать _id из массива
//     { new: true },
//   );
// };

const dislikeCard = async (req) => {
  try {
    const updatedCard = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } }, // убрать _id из массива
      { new: true },
    );
    return updatedCard;
  } catch (err) {
    throw new Error('Could not dislike card');
  }
};

module.exports = {
  getAllCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
};

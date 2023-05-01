// импортируем модель карточки из нашей схемы
const Card = require("../models/card");

const bodyParser = require('body-parser');

const handleError = (err, res) => {
  res.status(500).send({ message: "Произошла ошибка" });
};

// обработчик GET-запроса на получение списка всех карточек
const getAllCards = (req, res) => {
  // вызываем метод find без параметров и получаем все карточки из базы данных
  Card.find({})
    .then((cards) => {
      // отправляем список карточек обратно на клиент
      res.send(cards);
    })
    .catch((err) => {
      // отправляем ошибку обратно на клиент
      handleError(err, res);
    });
};

// обработчик POST-запроса на создание новой карточки
const createCard = (req, res) => {
  console.log(req.user._id);
  // достаем из тела запроса поля name и link
  const { name, link } = req.body;

  // создаем новый экземпляр карточки на основе модели
  const card = new Card({ name, link });

  // сохраняем новую карточку в базу данных
  card
    .save()
    .then((createdCard) => {
      // отправляем созданную карточку обратно на клиент
      res.send(createdCard);
    })
    .catch((err) => {
      // отправляем ошибку обратно на клиент
      handleError(err, res);
    });
};

// обработчик DELETE-запроса на удаление карточки по ID
const deleteCardById = (req, res) => {
  // достаем из параметров запроса ID карточки
  const { cardId } = req.params;

  // вызываем метод findByIdAndRemove и передаем ему ID карточки
  Card.findByIdAndRemove(cardId)
    .then((deletedCard) => {
      // отправляем удаленную карточку обратно на клиент
      res.send(deletedCard);
    })
    .catch((err) => {
      // отправляем ошибку обратно на клиент
      handleError(err, res);
    });
};

const setLikeCard = () => {
  console.log("setLike");
};

const deleteLikeCard = () => {
  console.log("deleteLike");
};

const likeCard = (req, res) =>
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true }
  );

const dislikeCard = (req, res) =>
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true }
  );

module.exports = {
  getAllCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
};

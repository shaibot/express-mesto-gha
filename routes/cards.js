const { getAllCards, createCard, deleteCardById, likeCard, dislikeCard } = require('../controllers/cards');

const cardsRouter = require('express').Router();

cardsRouter.get('/', getAllCards);
cardsRouter.post('/', createCard);
cardsRouter.delete('/:cardId', deleteCardById);

cardsRouter.put('/:cardId/likes', likeCard); // поставить лайк карточке
cardsRouter.delete('/:cardId/likes', dislikeCard) // убрать лайк с карточки

module.exports = cardsRouter;
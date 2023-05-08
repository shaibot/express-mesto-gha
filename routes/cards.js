const cardsRouter = require('express').Router();
const {
  getAllCards,
  createCard,
  likeCard,
  dislikeCard,
  deleteCards,
} = require('../controllers/cards');

cardsRouter.get('/', getAllCards);
cardsRouter.post('/', createCard);
cardsRouter.delete('/:cardId', deleteCards);

cardsRouter.put('/:cardId/likes', likeCard); // поставить лайк карточке
cardsRouter.delete('/:cardId/likes', dislikeCard); // убрать лайк с карточки

module.exports = cardsRouter;

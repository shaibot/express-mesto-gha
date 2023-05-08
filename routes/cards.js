const cardsRouter = require('express').Router();
const {
  getAllCards,
  createCard,
  likeCard,
  dislikeCard,
  deleteCards,
} = require('../controllers/cards');
const validateLikeRequest = require('../middlewares/validateLikeRequest');

cardsRouter.get('/', getAllCards);
cardsRouter.post('/', createCard);
cardsRouter.delete('/:cardId', deleteCards);

cardsRouter.put('/:cardId/likes', validateLikeRequest, likeCard); // поставить лайк карточке
cardsRouter.delete('/:cardId/likes', validateLikeRequest, dislikeCard); // убрать лайк с карточки

module.exports = cardsRouter;

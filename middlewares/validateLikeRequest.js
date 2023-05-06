const validateLikeRequest = (req, res, next) => {
  if (!req.params.cardId) {
    return res.status(400).json({ message: 'Missing cardId in request' });
  }
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return next();
};

module.exports = validateLikeRequest;

require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const errorCelebrate = require('celebrate').errors;
const router = require('./routes/index');
const { ERROR_INTERNAL_SERVER } = require('./utils/constants');
const { PORT, MONGODB } = require('./config');
const { handlerErrors } = require('./middlewares/handlerErrors');

const app = express();
mongoose.connect(MONGODB);

app.use(cookieParser());
app.use(express.json());
app.use('/', router);
app.use(errorCelebrate());
app.use(handlerErrors);

app.use((err, req, res, next) => {
  const { statusCode = ERROR_INTERNAL_SERVER, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === ERROR_INTERNAL_SERVER ? 'На сервере произошла ошибка' : message,
    });

  next();
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

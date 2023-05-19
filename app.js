const process = require('process');

// установить bodyParser
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

// создать сервер на Экспресс
const express = require('express');

const helmet = require('helmet');

const { PORT = 3000, BASE_PATH } = process.env;

const app = express();

const errors = require('./middlewares/errors');
// экспортируем роутеры
const router = require('./routes/index');

app.use(helmet());

mongoose
  .connect('mongodb://127.0.0.1:27017/mestodb')
  .catch((err) => console.log(err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', router);
app.use(errors);

process.on('uncaughtException', (err, origin) => {
  console.log(
    `${origin} ${err.name} c текстом ${err.message} не была обработана. Обратите внимание!`,
  );
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(BASE_PATH);
});

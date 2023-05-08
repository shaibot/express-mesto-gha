const process = require('process');

// установить bodyParser
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

// создать сервер на Экспресс
const express = require('express');

const helmet = require('helmet');

const { PORT = 3000, BASE_PATH } = process.env;

const app = express();

// экспортируем роутеры
const router = require('./routes/index');

app.use(helmet());

mongoose
  .connect('mongodb://127.0.0.1:27017/mestodb')
  .catch((err) => console.log(err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.user = {
    _id: '644fc37a80b31ef2247488a5', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

app.use('/', router);

process.on('uncaughtException', (err, origin) => {
  console.log(
    `${origin} ${err.name} c текстом ${err.message} не была обработана. Обратите внимание!`,
  );
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(BASE_PATH);
});

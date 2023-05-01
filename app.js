// создать сервер на Экспресс
//const express = require('express');

//const mongoose = require('mongoose');
//const app = express();

//const { PORT = 3000 } = process.env;

// установить bodyParser
const bodyParser = require("body-parser");

//экспортируем роутеры
//const router = require('./routes/index');

//mongoose.connect("mongodb://localhost:27017/mestodb");

//app.use('/', router);

// mongoose.connect("mongodb://localhost:27017/mestodb")

// mongoose.connect('mongodb://localhost:27017/mestodb', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => console.log('MongoDB connected'))
//   .catch((err) => console.log(err));

// Слушаем 3000 порт
//app.listen(PORT, () => {
// Если всё работает, консоль покажет, какой порт приложение слушает
//  console.log(`App listening on port ${PORT}`);
//});

const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/index");

const { PORT = 3000 } = process.env;
const app = express();
mongoose.connect("mongodb://127.0.0.1:27017/mestodb");

app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use((req, res, next) => {
  req.user = {
    _id: "644fc37a80b31ef2247488a5", // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

app.use("/", router);
// app.use((req, res) => {
//   res
//     .status(ERROR_NOT_FOUND)
//     .send({ message: `Страница не найдена ${ERROR_NOT_FOUND}` });
// });

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

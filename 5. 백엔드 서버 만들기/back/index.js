const express = require('express');

const app = express();

app.get('/', (req, res, next) => {
  res.send('Hello, Server');
});

app.get('/about', (req, res, next) => {
  res.send('about');
});

app.listen(3065, () => {
  console.log('server is running on (서버주소) : http://localhost:3065');
});
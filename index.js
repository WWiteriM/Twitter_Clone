const express = require('express');

const app = express();
const port = 3000;

app.set('view engine', 'pug');
app.set('views', 'views');

app.get('/', (req, res) => {
  const payload = {
    pageTitle: 'main',
  };
  res.status(200).render('home', payload);
});

app.listen(port);

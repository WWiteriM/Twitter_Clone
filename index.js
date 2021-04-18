const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { requireLogin } = require('./middleware');
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');

const app = express();
const port = 3000;

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/login', loginRoute);
app.use('/register', registerRoute);

app.get('/', requireLogin, (req, res) => {
  const payload = {
    pageTitle: 'main',
  };
  res.status(200).render('home', payload);
});

app.listen(port);

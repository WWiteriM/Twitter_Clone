const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
require('./database');
const { requireLogin } = require('./middleware');
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logoutRoutes');
const postPageRoute = require('./routes/api/postPages/index');
const profileRoute = require('./routes/api/profile/index');
const uploadRoute = require('./routes/api/upload/index');
const searchRoute = require('./routes/api/search/index');
const messagesRoute = require('./routes/api/messages/index');
const postApiRoute = require('./routes/api/posts/index');
const usersApiRoute = require('./routes/api/users/index');
const chatsApiRoute = require('./routes/api/chats/index');

const app = express();
const PORT = 3000;

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'secret word',
    resave: true,
    saveUninitialized: false,
  }),
);

app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/logout', logoutRoute);
app.use('/posts', requireLogin, postPageRoute);
app.use('/profile', requireLogin, profileRoute);
app.use('/search', requireLogin, searchRoute);
app.use('/messages', requireLogin, messagesRoute);
app.use('/uploads', uploadRoute);
app.use('/api/posts', postApiRoute);
app.use('/api/users', usersApiRoute);
app.use('/api/chats', chatsApiRoute);

app.get('/', requireLogin, (req, res) => {
  const payload = {
    pageTitle: 'Main',
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  res.status(200).render('home', payload);
});

app.listen(PORT);

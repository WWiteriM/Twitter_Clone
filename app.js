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
const notificationsRoute = require('./routes/api/notifications/index');
const postApiRoute = require('./routes/api/posts/index');
const usersApiRoute = require('./routes/api/users/index');
const chatsApiRoute = require('./routes/api/chats/index');

const app = express();
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT);
// eslint-disable-next-line import/order
const io = require('socket.io')(server, { pingTimeout: 60000 });

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
app.use('/notifications', requireLogin, notificationsRoute);
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

io.on('connection', (socket) => {
  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('connected');
  });

  socket.on('join', (room) => {
    socket.join(room);
  });

  socket.on('typing', (room) => {
    socket.in(room).emit('typing');
  });

  socket.on('stop typing', (room) => {
    socket.in(room).emit('stop typing');
  });

  socket.on('notification received', (room) => {
    socket.in(room).emit('notification received');
  });

  socket.on('new message', (newMessage) => {
    const chatData = newMessage.chat;

    if (!chatData[0].users) {
      return console.log('Chat.Users not defined');
    }

    chatData[0].users.forEach((user) => {
      if (user._id === newMessage.sender._id) return;
      socket.in(user._id).emit('message received', newMessage);
    });
  });
});

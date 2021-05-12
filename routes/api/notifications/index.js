const express = require('express');
const mongoose = require('mongoose');
const Chat = require('../../../schemas/chatSchema');
const User = require('../../../schemas/userSchema');
const Message = require('../../../schemas/messageSchema');

const router = express.Router();

router.get('/', (req, res) => {
  const payload = {
    pageTitle: 'Notifications',
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  res.status(200).render('notificationsPage', payload);
});

module.exports = router;

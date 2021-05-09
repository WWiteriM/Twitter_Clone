const express = require('express');
const Chat = require('../../../schemas/chatSchema');

const router = express.Router();

router.post('/', async (req, res) => {
  if (!req.body.users) {
    return res.sendStatus(400);
  }

  const users = JSON.parse(req.body.users);
  if (!users.length) {
    return res.sendStatus(400);
  }

  users.push(req.session.user);
  const chatData = {
    users,
    isGroupChat: true,
  };

  const results = await Chat.create(chatData).catch(() => {
    res.sendStatus(400);
  });
  res.status(200).send(results);
});

module.exports = router;

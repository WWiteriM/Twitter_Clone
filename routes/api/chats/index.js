const express = require('express');
const Chat = require('../../../schemas/chatSchema');

const router = express.Router();

router.get('/', async (req, res) => {
  const results = await Chat.find({ users: { $elemMatch: { $eq: req.session.user._id } } })
    .populate('users')
    .sort({ updatedAt: -1 })
    .catch(() => {
      res.sendStatus(400);
    });
  res.status(200).send(results);
});

router.get('/:chatId', async (req, res) => {
  const results = await Chat.findOne({
    _id: req.params.chatId,
    users: { $elemMatch: { $eq: req.session.user._id } },
  })
    .populate('users')
    .catch(() => {
      res.sendStatus(400);
    });
  res.status(200).send(results);
});

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

router.put('/:chatId', async (req, res) => {
  await Chat.findByIdAndUpdate(req.params.chatId, req.body).catch(() => {
    res.sendStatus(400);
  });
  res.sendStatus(204);
});

module.exports = router;

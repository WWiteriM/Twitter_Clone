const express = require('express');
const Chat = require('../../../schemas/chatSchema');
const User = require('../../../schemas/userSchema');
const Message = require('../../../schemas/messageSchema');

const router = express.Router();

router.get('/', (req, res) => {
  Chat.find({ users: { $elemMatch: { $eq: req.session.user._id } } })
    .populate('users')
    .populate('latestMessage')
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      if (req.query.unreadOnly !== undefined && req.query.unreadOnly === 'true') {
        // eslint-disable-next-line no-param-reassign
        results = await results.filter((r) => r.latestMessage[0] !== undefined);
        // eslint-disable-next-line no-param-reassign, max-len
        results = await results.filter(
          (r) => r.latestMessage[0].sender.toString() !== req.session.user._id,
        );
        // eslint-disable-next-line no-param-reassign, max-len
        results = await results.filter(
          (r) => !r.latestMessage[0].readBy.includes(req.session.user._id),
        );
      }
      // eslint-disable-next-line no-param-reassign
      results = await User.populate(results, { path: 'latestMessage.sender' });
      res.status(200).send(results);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
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

router.get('/:chatId/messages', async (req, res) => {
  const results = await Message.find({
    chat: req.params.chatId,
  })
    .populate('sender')
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

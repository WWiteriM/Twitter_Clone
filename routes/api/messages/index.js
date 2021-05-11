const express = require('express');
const mongoose = require('mongoose');
const Chat = require('../../../schemas/chatSchema');
const User = require('../../../schemas/userSchema');
const Message = require('../../../schemas/messageSchema');

const router = express.Router();

router.get('/', (req, res) => {
  const payload = {
    pageTitle: 'Inbox',
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  res.status(200).render('inboxPage', payload);
});

router.get('/new', (req, res) => {
  const payload = {
    pageTitle: 'New message',
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  res.status(200).render('newMessage', payload);
});

router.get('/:chatId', async (req, res) => {
  const userId = req.session.user._id;
  const { chatId } = req.params;
  const isValidId = mongoose.isValidObjectId(chatId);
  const payload = {
    pageTitle: 'Chat',
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };

  if (!isValidId) {
    payload.errorMessage = 'Chat does not exist or you do not have permission to view it';
    return res.status(200).render('chatPage', payload);
  }

  let chat = await Chat.findOne({ _id: chatId, users: { $elemMatch: { $eq: userId } } }).populate(
    'users',
  );

  if (!chat) {
    const userFound = await User.findById(chatId);
    if (userFound) {
      chat = await getChatByUserId(userFound._id, userId);
    }
  }
  if (!chat) {
    payload.errorMessage = 'Chat does not exist or you do not have permission to view it';
  } else {
    payload.chat = chat;
  }

  res.status(200).render('chatPage', payload);
});

router.post('/', async (req, res) => {
  if (!req.body.content || !req.body.chatId) {
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.session.user._id,
    content: req.body.content,
    chat: req.body.chatId,
  };

  let messageData = await Message.create(newMessage).catch(() => {
    res.sendStatus(400);
  });
  messageData = await messageData.populate('sender').execPopulate();
  messageData = await messageData.populate('chat').execPopulate();
  await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: messageData }).catch(() => {
    res.sendStatus(400);
  });

  res.status(201).send(messageData);
});

async function getChatByUserId(userLoggedIn, otherUserId) {
  const result = await Chat.findOneAndUpdate(
    {
      isGroupChat: false,
      users: {
        $size: 2,
        $all: [
          { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedIn) } },
          { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) } },
        ],
      },
    },
    {
      $setOnInsert: {
        users: [userLoggedIn, otherUserId],
      },
    },
    {
      new: true,
      upsert: true,
    },
  ).populate('users');

  return result;
}

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const Notification = require('../../../schemas/notificationsSchema');
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

router.get('/show', async (req, res) => {
  const result = await Notification.find({
    userTo: req.session.user._id,
    notificationType: { $ne: 'newMessage' },
  })
    .populate('userTo')
    .populate('userFrom')
    .sort({ createdAt: -1 })
    .catch(() => {
      res.sendStatus(400);
    });
  res.status(200).send(result);
});

router.put('/:id/markAsOpened', async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { opened: true }).catch(() => {
    res.sendStatus(400);
  });
  res.status(204);
});

router.put('/markAsOpened', async (req, res) => {
  await Notification.updateMany({ userTo: req.session.user._id }, { opened: true }).catch(() => {
    res.sendStatus(400);
  });
  res.status(204);
});

module.exports = router;

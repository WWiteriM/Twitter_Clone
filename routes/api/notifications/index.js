const express = require('express');
const Notification = require('../../../schemas/notificationsSchema');

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
  const searchObj = {
    userTo: req.session.user._id,
    notificationType: { $ne: 'newMessage' },
  };

  if (req.query.unreadOnly !== undefined && req.query.unreadOnly === 'true') {
    searchObj.opened = false;
  }

  Notification.find(searchObj)
    .populate('userTo')
    .populate('userFrom')
    .sort({ createdAt: -1 })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch(() => {
      res.sendStatus(400);
    });
});

router.get('/latest', async (req, res) => {
  Notification.findOne({
    userTo: req.session.user._id,
  })
    .populate('userTo')
    .populate('userFrom')
    .sort({ createdAt: -1 })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch(() => {
      res.sendStatus(400);
    });
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

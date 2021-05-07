const express = require('express');
const User = require('../../../schemas/userSchema');

const router = express.Router();

router.get('/:userId/following', async (req, res) => {
  const result = await User.findById(req.params.userId)
    .populate('following')
    .catch(() => {
      res.sendStatus(400);
    });
  res.status(200).send(result);
});

router.get('/:userId/followers', async (req, res) => {
  const result = await User.findById(req.params.userId)
    .populate('followers')
    .catch(() => {
      res.sendStatus(400);
    });
  res.status(200).send(result);
});

router.put('/:userId/follow', async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  if (user == null) {
    return res.sendStatus(404);
  }
  const isFollowing = user.followers && user.followers.includes(req.session.user._id);
  const option = isFollowing ? '$pull' : '$addToSet';

  req.session.user = await User.findByIdAndUpdate(
    req.session.user._id,
    { [option]: { following: userId } },
    { new: true },
  ).catch(() => {
    res.sendStatus(400);
  });

  await User.findByIdAndUpdate(userId, { [option]: { followers: req.session.user._id } }).catch(
    () => {
      res.sendStatus(400);
    },
  );

  return res.status(200).send(req.session.user);
});

module.exports = router;

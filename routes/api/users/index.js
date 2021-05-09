const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });
const User = require('../../../schemas/userSchema');

const router = express.Router();

router.get('/', async (req, res) => {
  let searchObj = req.query;

  if (req.query.search) {
    searchObj = {
      $or: [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { username: { $regex: req.query.search, $options: 'i' } },
      ],
    };
  }

  const result = await User.find(searchObj).catch(() => {
    res.sendStatus(400);
  });
  res.status(200).send(result);
});

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

router.post('/profilePicture', upload.single('croppedImage'), (req, res) => {
  if (!req.file) {
    console.log('No file uploaded');
    return res.sendStatus(400);
  }

  const filePath = `/uploads/images/${req.file.filename}.png`;
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, `../../../${filePath}`);
  fs.rename(tempPath, targetPath, async (error) => {
    if (error) {
      return res.sendStatus(400);
    }
    req.session.user = await User.findByIdAndUpdate(
      req.session.user._id,
      { profilePic: filePath },
      { new: true },
    );
    res.sendStatus(204);
  });
});

router.post('/coverPhoto', upload.single('croppedImage'), (req, res) => {
  if (!req.file) {
    console.log('No file uploaded');
    return res.sendStatus(400);
  }

  const filePath = `/uploads/images/${req.file.filename}.png`;
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, `../../../${filePath}`);
  fs.rename(tempPath, targetPath, async (error) => {
    if (error) {
      return res.sendStatus(400);
    }
    req.session.user = await User.findByIdAndUpdate(
      req.session.user._id,
      { coverPhoto: filePath },
      { new: true },
    );
    res.sendStatus(204);
  });
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

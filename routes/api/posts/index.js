const express = require('express');
const Post = require('../../../schemas/postSchema');
const User = require('../../../schemas/userSchema');

const router = express.Router();

router.get('/', async (req, res) => {
  const results = await Post.find()
    .populate('postedBy')
    .sort({ createdAt: -1 })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
  return res.status(200).send(results);
});

router.post('/', async (req, res) => {
  if (!req.body.content) {
    console.log('No params');
    return res.sendStatus(400);
  }
  const postData = {
    content: req.body.content,
    postedBy: req.session.user,
  };

  const newPost = await Post.create(postData).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });
  const post = await User.populate(newPost, { path: 'postedBy' });
  return res.status(201).send(post);
});

router.put('/:id/like', async (req, res) => {
  const postId = req.params.id;
  // eslint-disable-next-line no-underscore-dangle
  // const userId = req.session.user._id;

  const isLikes = req.session.user.likes && req.session.user.likes.includes(postId);
  console.log(`Is liked${isLikes}`);

  res.status(200).send('Yaho');
});

module.exports = router;

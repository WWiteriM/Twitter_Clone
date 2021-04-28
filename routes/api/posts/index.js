const express = require('express');
const Post = require('../../../schemas/postSchema');
const User = require('../../../schemas/userSchema');

const router = express.Router();

router.get('/', async (req, res) => {
  const results = await Post.find()
    .populate('postedBy')
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

module.exports = router;

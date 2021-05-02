const express = require('express');
const Post = require('../../../schemas/postSchema');
const User = require('../../../schemas/userSchema');

const router = express.Router();

router.get('/', async (req, res) => {
  const data = await Post.find()
    .populate('postedBy')
    .populate('retweetData')
    .sort({ createdAt: -1 })
    .catch(() => {
      res.sendStatus(400);
    });
  const result = await User.populate(data, { path: 'retweetData.postedBy' });
  return res.status(200).send(result);
});

router.post('/', async (req, res) => {
  if (!req.body.content) {
    return res.sendStatus(400);
  }
  const postData = {
    content: req.body.content,
    postedBy: req.session.user,
  };

  const newPost = await Post.create(postData).catch(() => {
    res.sendStatus(400);
  });
  const post = await User.populate(newPost, { path: 'postedBy' });
  return res.status(201).send(post);
});

router.put('/:id/like', async (req, res) => {
  const postId = req.params.id;
  // eslint-disable-next-line no-underscore-dangle
  const userId = req.session.user._id;
  const isLikes = req.session.user.likes && req.session.user.likes.includes(postId);
  const option = isLikes ? '$pull' : '$addToSet';

  req.session.user = await User.findByIdAndUpdate(
    userId,
    { [option]: { likes: postId } },
    { new: true },
  ).catch(() => {
    res.sendStatus(400);
  });

  const post = await Post.findByIdAndUpdate(
    postId,
    { [option]: { likes: userId } },
    { new: true },
  ).catch(() => {
    res.sendStatus(400);
  });

  res.status(200).send(post);
});

router.post('/:id/retweet', async (req, res) => {
  const postId = req.params.id;
  // eslint-disable-next-line no-underscore-dangle
  const userId = req.session.user._id;

  const deletedPost = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId }).catch(
    () => {
      res.sendStatus(400);
    },
  );

  const option = deletedPost ? '$pull' : '$addToSet';
  let repost = deletedPost;

  if (!repost) {
    repost = await Post.create({ postedBy: userId, retweetData: postId }).catch(() => {
      res.sendStatus(400);
    });
  }
  req.session.user = await User.findByIdAndUpdate(
    userId,
    // eslint-disable-next-line no-underscore-dangle
    { [option]: { retweets: repost._id } },
    { new: true },
  ).catch(() => {
    res.sendStatus(400);
  });

  const post = await Post.findByIdAndUpdate(
    postId,
    { [option]: { retweetUsers: userId } },
    { new: true },
  ).catch(() => {
    res.sendStatus(400);
  });

  res.status(200).send(post);
});

module.exports = router;

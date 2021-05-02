const express = require('express');
const Post = require('../../../schemas/postSchema');
const User = require('../../../schemas/userSchema');

const router = express.Router();

router.get('/', async (req, res) => {
  const result = await getPosts({});

  return res.status(200).send(result);
});

router.get('/:id', async (req, res) => {
  const postId = req.params.id;

  const data = await getPosts({ _id: postId });
  const result = data[0];

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

  if (req.body.replyTo) {
    postData.replyTo = req.body.replyTo;
  }

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

async function getPosts(filter) {
  const data = await Post.find(filter)
    .populate('postedBy')
    .populate('retweetData')
    .populate('replyTo')
    .sort({ createdAt: -1 })
    .catch((err) => {
      console.log(err);
    });

  const result = await User.populate(data, { path: 'replyTo.postedBy' });
  // eslint-disable-next-line no-return-await
  return await User.populate(result, { path: 'retweetData.postedBy' });
}

module.exports = router;

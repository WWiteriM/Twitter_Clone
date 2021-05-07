const express = require('express');
const Post = require('../../../schemas/postSchema');
const User = require('../../../schemas/userSchema');

const router = express.Router();

router.get('/', async (req, res) => {
  const searchObj = req.query;

  if (searchObj.isReply) {
    const isReply = searchObj.isReply === 'true';
    searchObj.replyTo = { $exists: isReply };
    delete searchObj.isReply;
  }

  const result = await getPosts(searchObj);
  return res.status(200).send(result);
});

router.get('/:id', async (req, res) => {
  const postId = req.params.id;

  let postData = await getPosts({ _id: postId });
  // eslint-disable-next-line prefer-destructuring
  postData = postData[0];

  const results = {
    postData,
  };

  if (postData.replyTo) {
    results.replyTo = postData.replyTo;
  }

  results.replies = await getPosts({ replyTo: postId });

  res.status(200).send(results);
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

router.post('/:id/retweet', async (req, res) => {
  const postId = req.params.id;
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

router.put('/:id/like', async (req, res) => {
  const postId = req.params.id;
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

router.delete('/:id', async (req, res) => {
  const deletedPost = await Post.findByIdAndDelete(req.params.id);
  if (!deletedPost) {
    res.sendStatus(400);
  }
  res.sendStatus(202);
});

async function getPosts(filter) {
  let result = await Post.find(filter)
    .populate('postedBy')
    .populate('retweetData')
    .populate('replyTo')
    .sort({ createdAt: -1 })
    .catch((err) => {
      console.log(err);
    });

  result = await User.populate(result, { path: 'replyTo.postedBy' });
  // eslint-disable-next-line no-return-await
  return await User.populate(result, { path: 'retweetData.postedBy' });
}

module.exports = router;

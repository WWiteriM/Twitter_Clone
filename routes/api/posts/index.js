const express = require('express');
const Post = require('../../../schemas/postSchema');
const User = require('../../../schemas/userSchema');
const Notification = require('../../../schemas/notificationsSchema');

const router = express.Router();

router.get('/', async (req, res) => {
  const searchObj = req.query;

  if (searchObj.isReply) {
    const isReply = searchObj.isReply === 'true';
    searchObj.replyTo = { $exists: isReply };
    delete searchObj.isReply;
  }

  if (searchObj.search) {
    searchObj.content = { $regex: searchObj.search, $options: 'i' };
    delete searchObj.search;
  }

  if (searchObj.followingOnly) {
    const followingOnly = searchObj.followingOnly === 'true';

    if (followingOnly) {
      const objectIds = [];

      if (!req.session.user.following) {
        req.session.user.following = [];
      }
      req.session.user.following.forEach((user) => {
        objectIds.push(user);
      });

      objectIds.push(req.session.user._id);
      searchObj.postedBy = { $in: objectIds };
    }
    delete searchObj.followingOnly;
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

  let newPost = await Post.create(postData).catch(() => {
    res.sendStatus(400);
  });
  newPost = await User.populate(newPost, { path: 'postedBy' });
  newPost = await Post.populate(newPost, { path: 'replyTo' });
  if (newPost.replyTo) {
    await Notification.insertNotification(
      newPost.replyTo.postedBy,
      req.session.user._id,
      'reply',
      newPost._id,
    );
  }

  return res.status(201).send(newPost);
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

  if (!deletedPost) {
    await Notification.insertNotification(post.postedBy, userId, 'retweet', post._id);
  }

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

  if (!isLikes) {
    await Notification.insertNotification(post.postedBy, userId, 'postLike', post._id);
  }

  res.status(200).send(post);
});

router.put('/:id', async (req, res) => {
  if (req.body.pinned) {
    await Post.updateMany({ postedBy: req.session.user }, { pinned: false }).catch(() => {
      res.sendStatus(400);
    });
  }
  const pinnedPost = await Post.findByIdAndUpdate(req.params.id, req.body);
  if (!pinnedPost) {
    res.sendStatus(400);
  }
  res.sendStatus(204);
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

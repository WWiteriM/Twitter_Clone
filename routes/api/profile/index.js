const express = require('express');

const User = require('../../../schemas/userSchema');

const router = express.Router();

router.get('/', (req, res) => {
  const payload = {
    pageTitle: req.session.user.username,
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    profileUser: req.session.user,
  };
  res.status(200).render('profilePage', payload);
});

router.get('/:username', async (req, res) => {
  const payload = await getPayload(req.params.username, req.session.user);
  res.status(200).render('profilePage', payload);
});

router.get('/:username/replies', async (req, res) => {
  const payload = await getPayload(req.params.username, req.session.user);
  payload.selectedTab = 'replies';
  res.status(200).render('profilePage', payload);
});

router.get('/:username/following', async (req, res) => {
  const payload = await getPayload(req.params.username, req.session.user);
  payload.selectedTab = 'following';
  res.status(200).render('followers', payload);
});

router.get('/:username/followers', async (req, res) => {
  const payload = await getPayload(req.params.username, req.session.user);
  payload.selectedTab = 'followers';
  res.status(200).render('followers', payload);
});

async function getPayload(username, userLoggedIn) {
  let user = await User.findOne({ username });
  if (!user) {
    user = await User.findById(username);

    if (!user) {
      return {
        pageTitle: 'User not found',
        userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
      };
    }
  }
  return {
    pageTitle: user.username,
    userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
    profileUser: user,
  };
}

module.exports = router;

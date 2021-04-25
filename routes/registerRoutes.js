const express = require('express');
const bcrypt = require('bcrypt');
const { registerValidate, registerSchema } = require('./validation/authValidation');
const User = require('../schemas/userSchema');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).render('register');
});

router.post('/', registerValidate(registerSchema), async (req, res) => {
  const payload = req.body;

  const user = await User.findOne({
    $or: [{ username: payload.username }, { email: payload.email }],
  }).catch(() => {
    payload.errorMessage = 'Something went wrong';
    res.status(200).render('register', payload);
  });

  if (!user) {
    const newUserData = req.body;
    newUserData.password = await bcrypt.hash(newUserData.password, 10);
    req.session.user = await User.create(newUserData);
    return res.redirect('/');
  }
  if (payload.email === user.email) {
    payload.errorMessage = 'Email already in use';
  } else {
    payload.errorMessage = 'Username already in use';
  }
  return res.status(200).render('register', payload);
});

module.exports = router;

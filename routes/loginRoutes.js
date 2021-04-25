const express = require('express');
const bcrypt = require('bcrypt');
const { loginValidate, loginSchema } = require('./validation/authValidation');
const User = require('../schemas/userSchema');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).render('login');
});

router.post('/', loginValidate(loginSchema), async (req, res) => {
  const payload = req.body;

  const user = await User.findOne({ email: payload.LogEmail }).catch(() => {
    payload.errorMessage = 'Something went wrong';
    res.status(200).render('login', payload);
  });

  if (user) {
    const result = await bcrypt.compare(payload.LogPassword, user.password);
    if (result === true) {
      req.session.user = user;
      return res.redirect('/');
    }
  }
  payload.errorMessage = 'Login credentials incorrect';
  return res.status(200).render('login', payload);
});

module.exports = router;

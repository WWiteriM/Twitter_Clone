const express = require('express');
const { validate, registerSchema } = require('./validation/authValidation');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).render('register');
});

router.post('/', validate(registerSchema), (req, res) => {
  res.status(200).render('register');
});

module.exports = router;

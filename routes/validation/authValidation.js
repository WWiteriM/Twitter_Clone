const yup = require('yup');

const registerSchema = yup.object().shape({
  firstName: yup.string().trim().required(),
  lastName: yup.string().trim().required(),
  username: yup.string().trim().required(),
  email: yup.string().email().required(),
  password: yup.string().min(4).max(20).required(),
  passwordConf: yup.string().min(4).max(20).required(),
});

const loginSchema = yup.object().shape({
  LogEmail: yup.string().email().required(),
  LogPassword: yup.string().min(4).max(20).required(),
});

function registerValidate(schema) {
  return async (req, res, next) => {
    await schema.validate(req.body).catch(() => {
      const payload = req.body;
      payload.errorMessage = 'Make sure each field has a valid value.';
      res.status(200).render('register', payload);
    });
    await next();
  };
}

function loginValidate(schema) {
  return async (req, res, next) => {
    await schema.validate(req.body).catch(() => {
      const payload = req.body;
      payload.errorMessage = 'Make sure each field has a valid value.';
      res.status(200).render('login', payload);
    });
    await next();
  };
}

module.exports = {
  registerSchema,
  loginSchema,
  registerValidate,
  loginValidate,
};

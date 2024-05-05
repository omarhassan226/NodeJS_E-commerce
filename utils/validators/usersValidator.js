// eslint-disable-next-line import/newline-after-import, import/no-extraneous-dependencies
const joi = require("joi");
const validateNewUser = (user) => {
  const schema = joi.object({
    name: joi.string().min(3).max(50).required(),
    email: joi
      .string()
      .email({
        tlds: {
          allow: false
        }
      })
      .required(),
    image: joi.string().max(255),
    password: joi.string().min(6).max(255).required(),
    isAdmin: joi.boolean(),
  });
  return schema.validate(user);
};
const validateUser = (user) => {
  const schema = joi.object({
    name: joi.string().min(3).max(50),
    email: joi.string().email({
      tlds: {
        allow: false
      }
    }),
    image: joi.string().max(255),
    password: joi.string().min(6).max(255),
    isAdmin: joi.boolean(),
  });
  return schema.validate(user);
};
module.exports = {
  validateNewUser,
  validateUser,
};
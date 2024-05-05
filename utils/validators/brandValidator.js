const { check } = require("express-validator");
// eslint-disable-next-line import/newline-after-import
const validatorMidelware = require("../../midleWare/validatorMidelware");
exports.getBrandyValidator = [
  check("id").isMongoId().withMessage("invalid id"),
  validatorMidelware,
];
exports.createBrandyValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name field can not be empty")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters short")
    .isLength({ max: 25 })
    .withMessage("Name must be at least 25 characters long"),
  validatorMidelware,
];
exports.updateBrandyValidator = [
  check("id").isMongoId().withMessage("invalid id"),
  validatorMidelware,
];
exports.deleteBrandyValidator = [
  check("id").isMongoId().withMessage("invalid id"),
  validatorMidelware,
];

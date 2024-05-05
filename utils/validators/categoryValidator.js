const { check } = require("express-validator");
const validatorMidelware = require("../../midleWare/validatorMidelware");
exports.getcategoryValidator = [
  check("id").isMongoId().withMessage("invalid id"),
  validatorMidelware,
];
exports.createcategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name field can not be empty")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters short")
    .isLength({ max: 25 })
    .withMessage("Name must be at least 25 characters long"),
  validatorMidelware,
];
exports.updatecategoryValidator = [
  check("id").isMongoId().withMessage("invalid id"),
  validatorMidelware,
];
exports.deletecategoryValidator = [
  check("id").isMongoId().withMessage("invalid id"),
  validatorMidelware,
];

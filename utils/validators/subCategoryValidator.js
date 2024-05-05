const { check } = require("express-validator");
// eslint-disable-next-line import/newline-after-import
const validatorMidelware = require("../../midleWare/validatorMidelware");
exports.getSubCategoryValidator = [
  check("id").isMongoId().withMessage("invalid id"),
  validatorMidelware,
];
exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name field can not be empty")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 3 characters short")
    .isLength({ max: 25 })
    .withMessage("Name must be at least 25 characters long"),
  check("category")
    .notEmpty()
    .withMessage("must be belong to category ")
    .isMongoId()
    .withMessage("invalid Category"),
  validatorMidelware,
];
exports.updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("invalid id"),
  validatorMidelware,
];
exports.deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("invalid id"),
  validatorMidelware,
];

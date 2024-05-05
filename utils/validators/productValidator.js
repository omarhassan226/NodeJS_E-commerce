const { check } = require("express-validator");
// eslint-disable-next-line import/newline-after-import
const validatorMidleware = require("../../midleWare/validatorMidelware");
// eslint-disable-next-line import/newline-after-import
const Category = require("../../models/categoryModel");
// eslint-disable-next-line import/newline-after-import
const subCategory = require("../../models/subCategoryModel");
exports.createProductValidator = [
  check("title")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 char")
    .notEmpty()
    .withMessage("product required"),
  check("description")
    .notEmpty()
    .withMessage("Description is required!")
    .isLength({ max: 2000 })
    .withMessage("too long description"),
  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isNumeric()
    .withMessage("Invalid quantity! must be number"),
  check("sold").optional().isNumeric().withMessage("must be number"),
  check("price")
    .notEmpty()
    .withMessage("Price is required")
    .isNumeric()
    .withMessage("Invalid price! Must be a number.")
    .isLength({ max: 32 })
    .withMessage("long long Price"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Invalid discounted price! Must be a number.")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price < value) {
        throw new Error("discounted price should less than the original price");
      }
      return true;
    }),
  check("colors")
    .optional()
    .isArray()
    .withMessage("Available colors should be an array of string"),
  check("imageCover").notEmpty().withMessage("Image cover is required!"),
  check("images")
    .optional()
    .isArray()
    .withMessage("Images should be an array of image paths"),
  check("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category id")
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category for this id: ${categoryId}`)
          );
        }
      })
    ),
  check("subcategories")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom((subcategoriesIds) =>
      subCategory
        .find({ _id: { $exists: true, $in: subcategoriesIds } })
        .then((result) => {
          if (result.length < 1 || result.length !== subcategoriesIds.length) {
            return Promise.reject(new Error(`Invalid subcategories Ids`));
          }
        })
    )
    .custom((val, { req }) =>
      subCategory
        .find({ category: req.body.category })
        .then((subcategories) => {
          const subCategoriesIdsInDB = [];
          // eslint-disable-next-line no-shadow
          subcategories.forEach((subCategory) => {
            subCategoriesIdsInDB.push(subCategory._id.toString());
          });
          // check if subcategories ids in db include subcategories in req.body (true)
          const checker = (target, arr) => target.every((v) => arr.includes(v));
          if (!checker(val, subCategoriesIdsInDB)) {
            return Promise.reject(
              new Error(`subcategories not belong to category`)
            );
          }
        })
    ),
  check("Brand").optional().isMongoId().withMessage("Invalid brand id"),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("Rating must be a number")
    .isLength({ min: 1 })
    .withMessage("At least one rating must be provided.")
    .isLength({ max: 5 })
    .withMessage("Too many ratings."),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("Ratings quantity must be a number"),
  validatorMidleware,
];
exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid product ID"),
  validatorMidleware,
];
exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid product ID"),
  validatorMidleware,
];
exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid product ID"),
  validatorMidleware,
];

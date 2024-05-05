/* eslint-disable import/newline-after-import */
// eslint-disable-next-line import/newline-after-import
const express = require("express");
// const router = express.Router();
// eslint-disable-next-line import/newline-after-import
const mainSubcategory = require("../controlers/subCategoryController");
const {
  createSubCategoryValidator,
  // getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require("../utils/validators/subCategoryValidator");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(createSubCategoryValidator, mainSubcategory.createSubcategory)
  .get(mainSubcategory.getSubCategory);
router
  .route("/:id")
  .get(mainSubcategory.getIdSubCategory)
  .put(updateSubCategoryValidator, mainSubcategory.updateSubCategory)
  .delete(deleteSubCategoryValidator, mainSubcategory.deleteSubCategory);
module.exports = router;

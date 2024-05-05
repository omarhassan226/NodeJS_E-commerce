// eslint-disable-next-line import/no-extraneous-dependencies
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/error");
const SubCategory = require("../models/subCategoryModel");
// const categoryModel = require("../models/categoryModel");
exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

exports.createSubcategory = asyncHandler(async (req, res) => {
  const { name, category } = req.body;
  // eslint-disable-next-line new-cap
  const subCategory = await new SubCategory({
    name,
    slug: slugify(name),
    category,
  });
  subCategory
    .save()
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      res.json(err);
    });
});
exports.createFilter = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};
exports.getSubCategory = asyncHandler(async (req, res) => {
  let filterObj = {};
  if (req.params.categoryId) filterObj = { category: req.params.categoryId };
  const queryStringObj = { ...req.query, ...filterObj };
  const excludesFildes = ["page", "sort", "limit", "fields"];
  excludesFildes.forEach((field) => delete queryStringObj[field]);
  //Apply filtration using [gte | gt | lte | lt]
  let queryStr = JSON.stringify(queryStringObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;
  const endIndex = page * limit;
  const pagination = {};
  const documentCount = await SubCategory.countDocuments();
  pagination.currentPage = page;
  pagination.limit = limit;
  pagination.numberPages = Math.ceil(documentCount / limit);
  //next page
  if (endIndex < documentCount) {
    pagination.nextPage = page + 1;
  }
  if (skip > 0) {
    pagination.prevPage = page - 1;
  }
  const paginationResult = pagination;
  let mongooseQuery = SubCategory.find(JSON.parse(queryStr))
    .skip(skip)
    .limit(limit);
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    mongooseQuery = mongooseQuery.sort(sortBy);
  } else {
    mongooseQuery = mongooseQuery.sort("-createAt");
  }
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    mongooseQuery = mongooseQuery.select(fields);
  } else {
    mongooseQuery.select("-__v");
  }
  if (req.query.keyword) {
    let query = {};
    if (SubCategory.modelName === "Product") {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: "i" } },
        { description: { $regex: req.query.keyword, $options: "i" } },
      ];
    } else {
      query = { name: { $regex: req.query.keyword, $options: "i" } };
    }
    mongooseQuery = SubCategory.find(query);
  }
  // const subCategory = await SubCategory.find(req.filterObj)
  //   .skip(skip)
  //   .limit(limit)
  //   .populate({ path: "category", select: "name -_id" });
  const subCategory = await mongooseQuery;
  res
    .status(200)
    .json({ results: subCategory.length, paginationResult, data: subCategory });
});

exports.getIdSubCategory = asyncHandler(async (req, res, next) => {
  // eslint-disable-next-line prefer-destructuring
  const id = req.params.id;
  console.log("aaa");
  const subCategory = await SubCategory.findById(id).populate("category");
  console.log(subCategory);
  if (!subCategory) {
    return next(new ApiError("SubCategory not found", 404));
    //  return res.status(400).json({ msg: "Category not found" });
  }
  res.status(200).json({ data: subCategory });
});
exports.updateSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, category } = req.body;
  const subCategory = await SubCategory.findOneAndUpdate(
    { _id: id },
    { name, slug: slugify(name), category },
    { new: true }
  );
  if (!subCategory) {
    return next(new ApiError("SubCategory not found", 404));
    // return res.status(400).json({ msg: "Category not found" });
  }
  res.status(200).json({ data: subCategory });
});
exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await SubCategory.findOneAndDelete(id);
  if (!subCategory) {
    return next(new ApiError("subCategory not found", 404));
  }
  // return res.status(400).json({ msg: "Category not found" });
  res.status(200).send();
});

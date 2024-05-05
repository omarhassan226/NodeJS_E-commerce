const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const categoryModel = require("../models/categoryModel");
const ApiError = require("../utils/error");
const asyncHandler = require("express-async-handler");

const multerStorage = multer.memoryStorage();
const multerFilter = function (req, file, cb) {
  console.log(req.body)
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError("only images", 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadCategoryImage = upload.single("image");
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`uploads/categories/${filename}`);
    //.toFile(`../../Angular/E-commerce-Angular/src/assets/images/categories/${filename}`);

  req.body.image = filename;
  next();
});


exports.get = asyncHandler(async (req, res) => {
  const queryStringObj = { ...req.query };
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
  const documentCount = await categoryModel.countDocuments();
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
  let mongooseQuery = categoryModel
    .find(JSON.parse(queryStr))
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
    if (categoryModel.modelName === "Product") {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: "i" } },
        { description: { $regex: req.query.keyword, $options: "i" } },
      ];
    } else {
      query = { name: { $regex: req.query.keyword, $options: "i" } };
    }
    mongooseQuery = categoryModel.find(query);
  }
  const categories = await mongooseQuery;
  res
    .status(200)
    .json({ results: categories.length, paginationResult, data: categories });
});


exports.getId = asyncHandler(async (req, res, next) => {
  // eslint-disable-next-line prefer-destructuring
  const id = req.params.id;
  const category = await categoryModel.findById(id);
  if (!category) {
    return next(new ApiError("Category not found", 404));
    //  return res.status(400).json({ msg: "Category not found" });
  }
  res.status(200).json({ data: category });
});
exports.update = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  const category = await categoryModel.findOneAndUpdate(
    { _id: id },
    { name },
    { new: true }
  );
  if (!category) {
    return next(new ApiError("Category not found", 404));
  }
  // return res.status(400).json({ msg: "Category not found" });
  res.status(200).json(category);
});
exports.delete = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await categoryModel.findOneAndDelete(id);
  if (!category) {
    return next(new ApiError("Category not found", 404));
  }
  // return res.status(400).json({ msg: "Category not found" });
  res.status(200).send();
});
exports.create = asyncHandler(async (req, res) => {
  // eslint-disable-next-line prefer-destructuring
  const { name, image } = req.body;
  console.log(req.body)
  // eslint-disable-next-line new-cap
  const newCategory = await new categoryModel({ name, image });
  newCategory
    .save()
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      res.json(err);
    });
  // categoryModel.create({ name }).then((category) =>
  //   res
  //     .status(201)
  //     .json({ data: category })
  //     .catch((err) => {
  //       res.status(400).send(err);
  //     })
  // );
});

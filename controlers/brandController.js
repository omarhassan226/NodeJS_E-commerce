const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/error");
const brandModel = require("../models/brandModel");

const multerStorage = multer.memoryStorage();
const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError("only images", 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadBrandImage = upload.single("image");
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file || !req.file.buffer) {
    return next(
      new ApiError("No file uploaded or file buffer is missing", 400)
    );
  }
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`uploads/categories/${filename}`);
  req.body.image = filename;
  next();
});
exports.get = asyncHandler(async (req, res) => {
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const queryStringObj = { ...req.query };
  const excludesFildes = ["page", "sort", "limit", "fields"];
  excludesFildes.forEach((field) => delete queryStringObj[field]);
  let queryStr = JSON.stringify(queryStringObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;
  const endIndex = page * limit;
  const pagination = {};
  const documentCount = await brandModel.countDocuments();
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
  let mongooseQuery = brandModel
    .find(JSON.parse(queryStr))
    .skip(skip)
    .limit(limit)
    .populate({ path: "category", select: "name" });
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    mongooseQuery = mongooseQuery.sort(sortBy);
  } else {
    mongooseQuery = mongooseQuery.sort("-createAt");
  }
  //fields
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    mongooseQuery = mongooseQuery.select(fields);
  } else {
    mongooseQuery.select("-__v");
  }
  //search
  if (req.query.keyword) {
    let query = {};
    if (brandModel.modelName === "Product") {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: "i" } },
        { description: { $regex: req.query.keyword, $options: "i" } },
      ];
    } else {
      query = { name: { $regex: req.query.keyword, $options: "i" } };
    }
    mongooseQuery = brandModel.find(query);
  }
  const brands = await mongooseQuery;

  res
    .status(200)
    .json({ results: brands.length, paginationResult, data: brands });
});
exports.getId = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const brand = await brandModel.findById(id);
  if (!brand) {
    return next(new ApiError("brand not found", 404));
  }
  res.status(200).json({ data: brand });
});
exports.update = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  const brand = await brandModel.findOneAndUpdate(
    { _id: id },
    { name },
    { new: true }
  );
  if (!brand) {
    return next(new ApiError("brand not found", 404));
  }
  res.status(200).json(brand);
});
exports.delete = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await brandModel.findOneAndDelete(id);
  if (!brand) {
    return next(new ApiError("brand not found", 404));
  }
  res.status(200).send();
});
exports.create = asyncHandler(async (req, res) => {
  const { name, image } = req.body;
  const newBrand = await new brandModel({ name, image });
  newBrand
    .save()
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      res.json(err);
    });
});

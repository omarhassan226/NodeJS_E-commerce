const slugify = require("slugify");
const product = require("../models/productModel");
const ApiError = require("../utils/error");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const sharp = require("sharp");
const { emit } = require("nodemon");
const { v4: uuidv4 } = require("uuid");
const { json } = require("express");

const multerStorage = multer.memoryStorage();
const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError("only images", 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadProductImage = upload.fields([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.files.imageCover) {
    const filename = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      //.toFile(`uploads/products/${filename}`);
     .toFile(`../../Angular/E-commerce-Angular/src/assets/images/products/${filename}`);
    req.body.imageCover = filename;
  }

  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);
        // .toFile(`../../Angular/E-commerce-Angular/src/assets/images/products/${imageName}`);
        req.body.images.push(imageName);
      })
    );
  }
  next();
});
exports.get = asyncHandler(async (req, res) => {
  let filterObj = {};
  if (req.params.categoryId) filterObj = { category: req.params.categoryId };
  const queryStringObj = { ...req.query, ...filterObj };
  //console.log(queryStringObj)
  const excludesFildes = ["page", "sort", "limit", "fields", "keyword"];
  excludesFildes.forEach((field) => delete queryStringObj[field]);
  let queryStr = JSON.stringify(queryStringObj);
  //console.log(queryStr)
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  //console.log(queryStr)

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 50;
  const skip = (page - 1) * limit;
  const endIndex = page * limit;
  const pagination = {};
  let documentCount;

  let query = {};
  //search
  if (req.query.keyword) {
    if (product.modelName === "Product") {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: "i" } },
        { description: { $regex: req.query.keyword, $options: "i" } },
      ];
    } else {
      query = { title: { $regex: req.query.keyword, $options: "i" } };
    }
  }
  //console.log(queryStr)
  if (req.params.categoryId) {
    query = { ...query, ...filterObj };
  }
  const parsed = JSON.parse(queryStr);
  query = { ...query, ...parsed };

  //build query
  let mongooseQuery = product.find(query);
  let allProducts = await mongooseQuery;
  //console.log(allProducts);

  //sorting
  const sortBy = req.query.sort
    ? req.query.sort.split(",").join(" ")
    : "-createdAt";

  mongooseQuery = product
    .find(query)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .populate({ path: "category", select: "name" });

  //fields
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    mongooseQuery = mongooseQuery.select(fields);
  } else {
    mongooseQuery.select("-__v");
  }

  //excute
  const products = await mongooseQuery;

  documentCount = allProducts.length;

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
  res.status(200).json({
    results: products.length,
    documentCount,
    paginationResult,
    data: products,
  });
});
exports.getId = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const products = await product
    .findById(id)
    .populate({ path: "category", select: "name" });
  if (!products) {
    return next(new ApiError("products not found", 404));
  }
  res.status(200).json({ data: products });
});
exports.update = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.title) {
    req.body.slug = slugify(req.body.title);
  }

  const products = await product.findOneAndUpdate(
    { _id: id },
    { ...req.body, price: +req.body.price, quantity: +req.body.quantity },
    {
      new: true,
    }
  );
  if (!products) {
    return next(new ApiError("products not found", 404));
  }
  res.status(200).json(products);
});
exports.delete = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const products = await product.deleteOne({ _id: id });
  if (!products) {
    return next(new ApiError("products not found", 404));
  }
  res.status(200).send({ message: "deleted", products });
});

exports.create = asyncHandler(async (req, res) => {
  req.body.slug = slugify(req.body.title);
  const products = await product.create({
    ...req.body,
    price: +req.body.price,
    quantity: +req.body.quantity,
  });
  res.status(201).json(products);
});

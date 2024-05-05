const Product = require("../models/productModel");
const Review = require("../models/reviewModel");
const User = require("../models/userModel");

const getProductReviews = async (req, res) => {
  const queryStringObj = { ...req.query, product: req.params.id };
  console.log(queryStringObj);
  console.log(req.params.id);
  const excludesFildes = ["page", "sort", "limit", "fields"];
  excludesFildes.forEach((field) => delete queryStringObj[field]);
  let queryStr = JSON.stringify(queryStringObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  console.log(queryStr);
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 50;
  const skip = (page - 1) * limit;
  const endIndex = page * limit;
  const pagination = {};
  const documentCount = await Review.countDocuments({ product: req.params.id });
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
  let mongooseQuery = Review.find(JSON.parse(queryStr))
    .skip(skip)
    .limit(limit)
    .populate("user"); //sorting
  //console.log(mongooseQuery)
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
    if (Review.modelName === "Review") {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: "i" } },
        { description: { $regex: req.query.keyword, $options: "i" } },
      ];
    } else {
      query = { name: { $regex: req.query.keyword, $options: "i" } };
    }
    mongooseQuery = Review.find(query);
  }
  const reviews = await mongooseQuery;

  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 5;
  // const skip = (page - 1) * limit;
  // const Reviews = await Review.find()
  //   .populate("user")

  res
    .status(200)
    .json({ results: reviews.length, paginationResult, data: reviews });
};

const addProductReviews = async (req, res) => {
  try {
    const { reviewDetails, rating } = req.body;
    const user = req.user;
    const { id } = req.params;

    if (!user || !reviewDetails) {
      res.status(404).send({
        message: "missed data",
      });
      return;
    }

    const product = await Product.findOne({
      _id: id,
    });
    if (!product) {
      res.status(422).send("invalid");
      return;
    }

    if (rating) {
      const oldRating = product.ratingsAverage;
      const oldQuantity = product.ratingsQuantity;
      if (!oldRating) {
        await Product.updateOne(
          {
            _id: id,
          },
          {
            $set: {
              ratingsAverage: rating,
              ratingsQuantity: 1,
            },
          }
        );
      } else {
        const newRating = (oldRating + rating) / 2;
        await Product.updateOne(
          {
            _id: id,
          },
          {
            $set: {
              ratingsAverage: newRating,
              ratingsQuantity: oldQuantity + 1,
            },
          }
        );
      }
    }

    const review = await Review.create({
      reviewDetails: reviewDetails,
      user: user.id,
      product: id,
      rating,
    });
    res.send(review);
  } catch (error) {
    res.status(404).send({
      message: error.message,
    });
  }
};
const deleteProductReviews = async (req, res) => {
  try {
    const user = req.user;
    // const {
    //     user
    // } = req.headers;
    console.log(user);

    const { id } = req.params;

    if (!user) {
      res.status(404).send({
        message: "missed data",
      });
      return;
    }

    const review = await Review.findOne({
      _id: id,
    }).populate("user");
    if (!review) {
      res.status(422).send("invalid");
      return;
    }
    if (review.user.id !== user.id) {
      res.status(422).send("invalid2");
      return;
    }
    await review.deleteOne({
      _id: id,
    });

    res.json({ message: "deleted" });
  } catch (error) {
    res.status(404).send({
      message: error.message,
    });
  }
};

const editProductReviews = async (req, res) => {
  try {
    //const email =req.headers["email"];
    const { reviewDetails, rating } = req.body;
    const user = req.user;

    //const user = await User.findOne({email: email});

    const { id } = req.params;

    if (!user) {
      res.status(404).send({
        message: "missed data",
      });
      return;
    }

    const review = await Review.findOne({
      _id: id,
    }).populate("user");
    if (!review) {
      res.status(422).send("invalid1");
      return;
    }

    if (review.user.id != user.id) {
      res.status(422).send("invalid2");
      return;
    }
    const updatedReview = await Review.updateOne(
      {
        _id: id,
      },
      {
        reviewDetails,
      }
    );
    res.send(updatedReview);
  } catch (error) {
    res.status(404).send({
      message: error.message,
    });
  }
};

const addProductRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const { id } = req.params;

    if (!rating)
      return res.status(422).send({
        message: "missed data",
      });

    const product = await Product.findOne({
      _id: id,
    }).exec();

    if (!product) {
      return res.status(404).send({
        message: "invalid",
      });
    }

    const oldRating = product.rating;
    if (!oldRating) {
      await Product.updateOne(
        {
          _id: id,
        },
        {
          $set: {
            rating: rating,
          },
        }
      );
    } else {
      const newRating = (oldRating + rating) / 2;
      await Product.updateOne(
        {
          _id: id,
        },
        {
          $set: {
            rating: newRating,
          },
        }
      );
    }

    updatedProduct = await Product.findOne({
      _id: id,
    }).exec();
    res.send(updatedProduct);
  } catch (error) {
    res.status(404).send({
      message: error.message,
    });
  }
};

module.exports = {
  getProductReviews,
  addProductReviews,
  addProductRating,
  deleteProductReviews,
  editProductReviews,
};

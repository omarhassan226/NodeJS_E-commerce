const path = require("path");
const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const compression = require("compression");

dotenv.config({ path: ` ${__dirname}/config.env ` });
// eslint-disable-next-line import/no-useless-path-segments
const ApiError = require("./utils/error");
// eslint-disable-next-line import/no-useless-path-segments
const Error = require("./midleWare/errMidle");
// eslint-disable-next-line import/no-useless-path-segments
const database = require("./config/database");
// eslint-disable-next-line import/no-useless-path-segments
const categoryRoute = require("./routs/route");
// eslint-disable-next-line import/no-useless-path-segments
const SubcategoryRoute = require("./routs/subCategoryRoute");
// eslint-disable-next-line import/no-useless-path-segments
const brandRoute = require("./routs/brandRoute");
// eslint-disable-next-line import/order, no-unused-vars, import/newline-after-import, import/no-useless-path-segments
const orderRoute = require("./routs/orderRoute");
// eslint-disable-next-line import/no-useless-path-segments
const productsRoute = require("./routs/productRoute");
const reviewRoutes = require("./routs/reviewRoute");
const userProfileRoutes = require("./routs/userProfileRoute");
// eslint-disable-next-line import/no-useless-path-segments

const userRouter = require("./routs/usersRoute");
const shoppingCartRouter = require("./routs/shoppingRoute");
// const mongoose = require("mongoose");
const PORT = process.env.PORT || 8001;
// eslint-disable-next-line prefer-destructuring
const DB_URI = process.env.DB_URI;
database();

//express app
const app = express();
app.use(cors());
app.use(compression());
app.options(cors); // enable preflight requests for
//midelware
// app.use(route);
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}
//mount route
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/Subcategory", SubcategoryRoute);
app.use("/api/v1/brands", brandRoute);
app.use("/api/v1/products", productsRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/profile", userProfileRoutes);
app.use("/api/users", userRouter);
app.use("/api/carts", shoppingCartRouter);
app.use("/api/product", reviewRoutes);
app.use("*", (req, res, next) => {
  // const err = new Error("Not Found");
  // next(err.message);
  next(new ApiError("Not Found", 400));
});
//err handling midleware inside express
app.use(Error);
const server = app.listen(PORT, () => {
  console.log("app  raafat running on hamada");
});
//events =>listen ===>calback(err) outside express
process.on("unhandledRejection", (err) => {
  console.log(` unhandledRejection error: ${err.name} | ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

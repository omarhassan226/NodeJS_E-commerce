const Error = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message || "Server Error",
    stack: err.stack,
  });
};
module.exports = Error;

// const Error = (err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "error";
//   if (process.env.NODE_ENV === "development") {
//     sendError(err, res);
//   }
// };
// const sendError = (err, res) => {
//   return res.status(err.statusCode).json({
//     status: err.status,
//     error: err,
//     message: err.message || "Server Error",
//     stack: err.stack,
//   });
// };
// module.exports = Error;

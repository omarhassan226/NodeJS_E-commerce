const mongoose = require("mongoose");

const database = () => {
  mongoose
    .connect(
      "mongodb+srv://raafatheiba:raafatheiba@cluster0.hih44w0.mongodb.net/e-commerce-db"
    )
    .then((conn) => {
      console.log(`connected to the database ${conn.connection.host}`);
    });
};
module.exports = database;

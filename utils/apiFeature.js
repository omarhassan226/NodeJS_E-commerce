// class ApiFeature {
//   constructor(mongooseQuery, queryString) {
//     this.mongooseQuery = mongooseQuery;
//     this.queryString = queryString;
//   }
//   // eslint-disable-next-line lines-between-class-members
//   filter() {
//     //filtering
//     // eslint-disable-next-line node/no-unsupported-features/es-syntax
//     const queryStringObj = { ...this.queryString };
//     const excludesFildes = ["page", "sort", "limit", "fields"];
//     excludesFildes.forEach((field) => delete queryStringObj[field]);
//     //Apply filtration using [gte | gt | lte | lt]
//     let queryStr = JSON.stringify(queryStringObj);
//     // eslint-disable-next-line no-unused-vars
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//     this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
//     return this;
//   }

//   sort() {
//     if (this.queryString) {
//       const sortBy = this.queryString.sort.split(",").join(" ");
//       this.mongooseQuery = this.mongooseQuery.sort(sortBy);
//     } else {
//       this.mongooseQuery = this.mongooseQuery.sort("-createAt");
//     }
//     return this;
//   }

//   limitFields() {
//     if (this.queryString.fields) {
//       const fields = this.queryString.fields.split(",").join(" ");
//       this.mongooseQuery = this.mongooseQuery.select(fields);
//     } else {
//       this.queryString = this.mongooseQuery.select("-__v");
//     }
//     return this;
//   }

//   search() {
//     if (this.queryString.keyword) {
//       const query = {};
//       query.$or = [
//         { title: { $regex: this.queryString.keyword, $options: "i" } },
//         { description: { $regex: this.queryString.keyword, $options: "i" } },
//       ];
//       this.mongooseQuery = this.mongooseQuery.find(query);
//     }
//     return this;
//   }

//   paginate() {
//     const page = this.queryString.page * 1 || 1;
//     const limit = this.queryString.limit * 1 || 50;
//     const skip = (page - 1) * limit;

//     this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
//     return this;
//   }
// }
// module.exports = ApiFeature;

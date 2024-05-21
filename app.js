const express = require("express");
const morgan = require("morgan");
const booksRouter = require("./routes/booksRouter");
const userRouter = require('./routes/UserRouter');
const reviewRouter = require('./routes/ReviewRouter')

const app = express();

//1) MIDDLEWARES
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

// 3) ROUTES
app.use("/api/v1/books", booksRouter);
app.use("/api/v1/users", userRouter);
app.use('/api/v1/reviews', reviewRouter);


module.exports = app;

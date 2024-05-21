const express = require("express");
const booksController = require("./../Controllers/bookController");
const authController = require("./../Controllers/authController");
const reviewController = require("./../Controllers/reviewController");

const router = express.Router();

router
  .route("/top-5-Book")
  .get(
    authController.protect,
    booksController.aliasTopbook,
    booksController.getAllBooks
  );

router
  .route("/")
  .get(authController.protect, booksController.getAllBooks)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    booksController.createBook
  );

router
  .route("/:id")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    booksController.getBook
  )
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    booksController.uploadCoverimage,
    booksController.updateBook
  );

router
  .route("/:bookId/reviews")
  .post(
    authController.protect,
    authController.restrictTo("user"),
    reviewController.createReview
  )
  .get(
    authController.protect,
    authController.restrictTo("user", "admin"),
    reviewController.getAllReviews
  );

module.exports = router;

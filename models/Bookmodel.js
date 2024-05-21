const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A Book is Required"],
      unique: true,
      trim: true,
      maxlength: [40, "Book length is less or equal 40"],
      minlength: [1, "Book length is more or equal 1"],
    },
    author: {
      type: String,
      required: [true, "A Book must Consider the Author Name"],
    },
    ISBN: {
      type: String,
      required: [true, "A book must have a IDB_NUMBER"],
    },
    genre: {
      type: String,
      required: [true, "A book must have a genre"],
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A book must have a price"],
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A book must have a description"],
    },
    imageCover: {
      type: String,
      required: [true, "A book must have a cover image"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

BookSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'book',
  localField: '_id'
});


const Book = mongoose.model('Book', BookSchema);

module.exports = Book;

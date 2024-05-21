const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true , 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 10
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    book: {
      type: mongoose.Schema.ObjectId,
      ref: 'Book',
      required: [true, 'Review must belong to a book.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.pre(/^find/, function(next){
  this.populate({
    path: 'book',
    select: 'title'
  }).populate({
    path: 'user',
    select: 'name'
  })

  // this.populate({
  //   path: 'user',
  //   select: 'name'
  // })
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
const Review = require("./../models/Reviewmodel");


exports.getAllReviews = async (req, res, next) => {
  try {
    let filter = {};
        if (req.params.bookId) filter = { book: req.params.bookId };
    const reviews = await Review.find(filter);

    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: {
        reviews,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "something went wrong please try again",
    });
  }
};

exports.createReview = async (req, res, next) => {
  try {
    if (!req.body.book) req.body.book = req.params.bookId;
    if (!req.body.user) req.body.user = req.user.id;
    const newReview = await Review.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        data: newReview,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "something went wrong please try again",
    });
  }
};

exports.deleteReview = async (req, res, next) => {
  try{
    const document = await Review.findByIdAndDelete(req.params.id);

    if (!document) {
     return next(res.status(404).json({
      status: 'fail',
      message: 'No document found with that ID'
     }));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  }catch(err){
    res.status(404).json({
      status: 'fail',
      message: 'something went wrong please try again'
     });
  }
   
  };

  exports.updateReview = async (req, res, next) => {
    try{
      const document = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
  
      if (!document) {
        return next(res.status(404).json({
          status: 'fail',
          message: 'No document found with that ID'
         }));
      }
  
      res.status(200).json({
        status: 'success',
        data: {
          data: document
        }
      });
    }catch(err){
      res.status(404).json({
        status: 'fail',
        message: 'something went wrong please try again'
       });
    }
   
  };

  exports.getReview = async (req, res, next) => {
   try{
const document = await Review.findById(req.params.id)

    if (!document) {
      return next(res.status(404).json({
        status: 'fail',
        message: 'No document found with that ID'
       }));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: document
      }
    });
   }catch(err){
    res.status(404).json({
      status: 'fail',
      message: 'something went wrong please try again'
    });
   }
    
  };

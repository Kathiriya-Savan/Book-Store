const Book = require("./../models/Bookmodel");
const multer = require('multer');
const APIFeatures = require("./../utils/apiFeatures");

exports.aliasTopbook = (req, res, next) => {
  req.query.limit = req.query.limit;
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "title,author,price,ratingsAverage,summary";
  next();
};

const multerStorage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null , 'public/img');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    req.body.imageCover = `book-${req.user.id}-${Date.now()}.${ext}`;
    cb(null, req.body.imageCover);

  }
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(res.status(400).json({
      status: 'fail',
      message: 'Not an image! Please upload only images.'
    }),false)
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadCoverimage = upload.single('imageCover');

exports.getAllBooks = async (req, res) => {
  try {
    // EXECUTE QUERY
    const features = new APIFeatures(Book.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "something went wrong please try again",
    });
  }
};

exports.createBook = async (req, res) => {
  try {
    const newBook = await Book.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        newBook,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "Fail",
      message: "Something went wrong please Re-Create the Book",
    });
  }
};

exports.getBook = async(req, res) => {
  try{
    let books = await Book.findById(req.params.id).populate('reviews');
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: books.length,
      data: {
        books
      }
    });
  }catch(err){
    res.status(404).json({
      status: 'fail',
      message: 'something went wrong please try again'
    });
  }
};

exports.updateBook = async (req, res) => {
  try{
    const books = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators:true
    });

    res.status(200).json({
      status: 'success',
      data: {
        books
      }
    });
  }catch(err){
    res.status(404).json({
      status: 'fail',
      message: 'something went wrong please try again'
    });
  }
 
};

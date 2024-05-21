const User = require("./../models/Usermodel");

exports.getAllUsers = async (req, res, next) => {
  try {
    const AllUsers = await User.find();

    //Send Response
    res.status(200).json({
      status: "success",
      results: AllUsers.length,
      data: {
        AllUsers,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Something went wrong please try again",
    });
  }
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined! Please use /signup instead",
  });
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(
        res.status(404).json({
          status: "fail",
          message: "No User Found With this Id",
        })
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        data: user,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Something went wrong",
    });
  }
};

const Filtering_Field = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((e1) => {
    if (allowedFields.includes(e1)) newObj[e1] = obj[e1];
  });
  return newObj;
};

exports.updateMe = async (req, res, next) => {
  try {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        res.status(400).json({
          status: "fail",
          message:
            "This route is not for password updates. Please use /updateMyPassword.",
        })
      );
    }
    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = Filtering_Field(req.body, "name", "email");
    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "something went wrong please try again",
    });
  }
};

exports.deleteMe = async (req, res, next) => {
  try{
    await User.findByIdAndUpdate(req.user.id, { active: false });

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

exports.deleteUser = async (req , res , next) => {
  try{
    const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(
      res.status(404).json({
        status: "fail",
        message: "No User Found With this Id",
      })
    );
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
  }catch(err){
    res.status(404).json({
      status: "fail",
      message: "something went wrong"
    })
  }
}
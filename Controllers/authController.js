const jwt = require("jsonwebtoken");
const User = require("./../models/Usermodel");
const { promisify } = require("util");
const sendEmail = require("./../utils/email");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    const token = signToken(newUser._id);

    res.status(200).json({
      status: "success",
      token,
      data: {
        User: newUser,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "something went wrong please try again!",
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email && !password) {
      return next(
        res.status(404).json({
          data: {
            message: "please provide email and passsword",
          },
        })
      );
    }

    const user = await User.findOne({ email }).select("+password");
    const correct = await user.correctPassword(password, user.password);

    if (!user || !correct) {
      return next(
        res.status(401).json({
          data: {
            message: "Incorrect email or password",
          },
        })
      );
    }
    const token = signToken(user._id);
    res.status(200).json({
      token,
      status: "success",
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Something went wrong",
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(
        res.status(401).json({
          status: "fail",
          message: "You are not logged in please login again",
        })
      );
    }

    // 2) Verification token
    const Token_Decode = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    // 3) Check if user still exists
    const freshuser = await User.findById(Token_Decode.id);
    if (!freshuser) {
      return next(
        res.status(401).json({
          status: "fail",
          message: "The User Belong to this token does no longer exit",
        })
      );
    }

    // 4) Check if user changed password after the token was issued
    if (freshuser.changedPasswordAfter(Token_Decode.iat)) {
      return next(
        res.status(401).json({
          status: "fail",
          message: "User recently changed password! Please log in again.",
        })
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = freshuser;
    next();
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "something went wrong please try again",
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'user']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        res.status(403).json({
          status: "fail",
          message: "You do not have permission to perform this action",
        })
      );
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  try {
    //1) Get user based on Posted Email

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        res.status(404).json({
          status: "fail",
          message: "There is no user with email address.",
        })
      );
    }
    console.log("Hii I am Savnan");
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 10 min)",
        message,
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: "fail",
        message: "There was an error sending the email. Try again later!",
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Something went wrong please provide the email address",
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      res.status(400).json({
        status: "fail",
        message: "Token is invalid or has expired",
      });
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 4) Log the user in, send JWT

    const token = signToken(user._id);

    res.status(200).json({
      token,
      status: "success",
      data: {
        user: user,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "something went wrong please try again",
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select("+password");

    // 2) Check if POSTed current password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return res.status(401).json({
        status: "fail",
        message: "Your Current Password is not correct",
      });
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended!

    // 4) Log user in, send JWT

    const token = signToken(user._id);

    res.status(200).json({
      token,
      status: "success",
      data: {
        user: user,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "something went wrong please try again",
    });
  }
};

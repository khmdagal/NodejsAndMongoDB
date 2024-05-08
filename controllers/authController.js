const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  // the best practice is store the secret in the configuration file 'env' file
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
  next();
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if the email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 401));
  }

  //2) check if the user exists && password is correct

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = signToken(user._id);
  // here we are calling the function the we created in the model to check if the entered password really matched the hashed password that is stored in the database.
  // === REMEMBER : the 'user' we are calling here is
  //const correct = !(await user.correctPassword(password, user.password)); // this should have await because is return a promise
  // if (!correct) next(new AppError('Incorrect email or password', 401));

  res.status(200).json({
    token: token
  });
 
});

// exports.protect = catchAsync(async (req, res, next) => {
//   // 1) get token and check if it is there
//   let token;
//   if (
//     req.headers.Authorization &&
//     req.headers.Authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.Authorization.split(' ')[1];

//   }

//     console.log('=====>>>>', token);
//   // 2) verification token
//   if (!token) {
//     return new AppError(' you are not login', 401);
//   }
//   // 3) check if the user exists

//   // 4) check if the user changed the password after the jwt was issued
//   next();
// });

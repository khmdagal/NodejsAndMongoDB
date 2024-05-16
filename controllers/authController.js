const { promisify } = require('util');
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
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });
  // the best practice is store the secret in the configuration file 'env' file
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  return res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
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

exports.protect = catchAsync(async (req, res, next) => {
  // 1) get token and check if it is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // check if the token exists
  if (!token) {
    return next(new AppError('your are not logged in', 401));
  }

  // 2 verify the token
  /*
  In this step we are using jwt.verify() method
  1 it takes the token as the first argument and read it
  2 and takes the secret key as the second argument where you probably saved in your env file
  3 and it takes a callback function as the third argument
  4 this method returning a promise when the token verification is completed
  5 we are going to promisify this method and will use Node built-in promisify function.
   */

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  /*
  To make secure our server and database we need to take step 3 and 4 
   step 3 we need to check if the user exists after the token was issued
   step 4 we need to check if the password was not modified after the token was issued
  these two steps will protect for example if the token was stolen that token will not pass when the user is checked if that user still exits
  */
  // 3) check if the user exists
  const accessedUser = await User.findById(decoded.id);
  if (!accessedUser) {
    return new AppError('User no logger exist', 401);
  }

  // 4) check if the user changed the password after the jwt was issued
  /*
  this step is important and it will involve the user model in order to add a new field
  that will record every last time that the user changes password
  and then comparing that time stamp in the database and the time that the token was created
  */
  // if user exists we need to see the expire time
  if (accessedUser.changedPasswordAfterTokenIssued(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please login again!!', 401)
    );
  }

  //THEN NOW GRANT ACCESS TO PROJECTED ROUTE

  // If we want to pass some data from one middleware to another the req travels from one middleware to another
  // so it is good practice to assign the authenticated user who access was granted
  req.user = accessedUser;
  next();
});

exports.restrictTo = (...roles) => {
  //console.log(roles)
  return (req, res, next) => {
    //console.log("==user=====>>",req.user)
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`You don't have permission to perform this action`, 402)
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // find if the user email exist
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new AppError('User not exist',404))
  }
  // Generate the random rest token
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })
  return resetToken
  // send it to the user's email
})
exports.reset = catchAsync(async (req, res, next) => {
  
})
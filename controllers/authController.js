const crypto = require('crypto')
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email')

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // sending the token through the cookie
  // When sending cookies we attached it to the RESPONSE
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000), // we converting to milliseconds
    //secure: true, // this option encrypting the token, I just comment out because I am testing this in the postman now
    httpOnly:true // this option will make impossible to manipulate the token over the browser 
  }
  
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt',token,cookieOptions)



  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  })
}
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
  createAndSendToken(newUser, 201,res)
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

  //const token = signToken(user._id); we replace this token creation function
  // here we are calling the function the we created in the model to check if the entered password really matched the hashed password that is stored in the database.
  // === REMEMBER : the 'user' we are calling here is
  //const correct = !(await user.correctPassword(password, user.password)); // this should have await because is return a promise
  // if (!correct) next(new AppError('Incorrect email or password', 401));

  createAndSendToken(user, 200,res)
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
  
  //===== sending it to the user's email
  // set the URl
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/user/resetPassword/${resetToken}`;
  // Set the message
  const message = `Forgot your password? Submit a PATCH request with your new password and
  passwordConfirm to :${resetURL}. \n If you didn't forget your password, please ignore this email!`;
  // send the email

  try {
    await sendEmail({
    email: user.email,
    subject: 'Your password rest token (valid 10 min)',
    text: message
  })

  res.status(200).json({
    status: 'success',
    message: message
  })
  } catch (error) {
    user.passwordResetToken = undefined,
    user.passwordResetExpires = undefined,
    next(new AppError('error happened', 500))
  }
  


})
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  })
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    next(new AppError('Token is invalid or expired', 400))
  }
  // 3) Update changedPasswordAt property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined
  // the above code will only modify the document but not saved so we need to save the changes now
  await user.save() // and now we don't need to turn off the validation because we want to the validation to take palace
  // 4) Log the user in, send JWT

  
 createAndSendToken(user,200,res)
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1 get user from collection
const user = await User.findById(req.user._id).select('+password')
  // 2 Check if the posted password is the current password and correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    next(new AppError('Your current password is wrong', 401))
  }
  
  // 3 if so update the password to the new one
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()

  // 4 log user in, and send JWT token
  /*
  We don't need this any more but keep it here for learning and remembering purpose
const token = signToken(user._id);
  
  res.status(200).json({
    status: 'success',
    newTokenAfterPasswordUpdated: token
  });
*/
   createAndSendToken(user,200,res)
})
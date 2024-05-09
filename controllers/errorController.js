const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate field vlaue : ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = err => {
  const error = err.name;

  if (error === 'JsonWebTokenError') {
    return new AppError(
      `Invalid token. ${error} please log in your account`,
      401
    );
  }
  if (error === 'TokenExpiredError') {
    return new AppError(
      `Your session has expired. Please login your account again`,
      401
    );
  }
};
module.exports = async (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // I DON'T UNDERSTAND WHY THE CODE IS NOT EXECUTING THE SWITCH STATEMENT OR IF STATEMENT

  // // DEVELOPMENT ERROR HANDLER
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  }
  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    )
      error = handleJsonWebTokenError(error);
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message
    });
  }
  //next();
};

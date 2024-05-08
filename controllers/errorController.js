module.exports = async (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // I DON'T UNDERSTAND WHY THE CODE IS NOT EXECUTING THE SWITCH STATEMENT OR IF STATEMENT

  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });

  // // DEVELOPMENT ERROR HANDLER
  // if (process.env.NODE_ENV === 'development') {
  
  // }
  // if (process.env.NODE_ENV === 'production') {
  //   const error = { ...err };
  //   return res.status(error.statusCode).json({
  //     status: error.status,
  //     message: error.message
  //   });
  // }
  next();
};

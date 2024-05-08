const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  })

}


const sendErrorProd = (err, res) => {
  // Operational, trusted err: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
    
    // this below part is Programming or other unknown error: don't leak error details
  } else {
    //1 lon the erro
    console.error('ERRR', err)

    //2 Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    })

  }
  

}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
 
  // Separate error handling for development and production
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res)
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res)
  }
};

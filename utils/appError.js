class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // we passed message here because the built in Error accepts only message parameter
    this.statusCode = statusCode;
    this.status = `${this.status}`.startsWith(4) ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
// we are extending the built in Error class to create our own custom error class
// we are passing the message and statusCode to the constructor
// we are setting the status code to the statusCode
// we are setting the status to fail if the statusCode starts with 4 else we set it to error
// we are setting isOperational to true
// we are capturing the stack trace of the error
// we are exporting the class

module.exports = AppError;

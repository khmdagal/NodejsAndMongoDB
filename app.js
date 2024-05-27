// core modules
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');


// Dev modules
const AppError = require('./utils/appError');
const globalErrorHandling = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/usersRoutes');

const app = express();



//GLOBAL MIDDLEWARES
/*
this can modify the incoming requests
it stands middle of the request and response
*/
//==== Set security HTTP headers
app.use(helmet()) // we put this a the top of all middlewares so the header to be set
                  // early on

//==== Development Logging
if (process.env.NODE_ENV === 'Development') {
  app.use(morgan('dev'))
}

//==== Limit requests from same API  
const limiter = rateLimit({
  max: 100, // This will limit how many requests are allowed for a given IP address
  windowMs: 1 * 60 * 60 * 1000, // after exceeding the maximum rate limit, this windowMs will all the user to try again after this
                                // period finishes  1 hours * 60 minutes * 60 seconds * 1000 milliseconds, so the whole period is
                                // changed to milliseconds
  message: 'Too many requests, please try again'
})
app.use('/api', limiter)

//==== Body parser, reading data from body into req. boyd
/*
We can limit data that comes in the body 
app.use(express.json({
  limit: '10kb
}));
*/
app.use(express.json());

// ==== Data sanitization against NoSQL query injection
app.use(mongoSanitize())

//===== Data sanitization against XSS
app.use(xss()) // this will clean any malicious html code, and it will convert all HTML symbols/
               // for the server side you can add extra validation to mongoose validation and will also protect from xss attacks.

//==== Serving static files
app.use(express.static(`${__dirname}/public`));
app.use(morgan('tiny'));

//==== Testing middleware
app.use((req, res, next) => {
  // we are manipulating request to add request time property to the req object
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handling

app.all('*', (req, res, next) =>
  next(new AppError(`can't find ${req.originalUrl} on this server`), 404)
);

// ====== GLOBAL ERROR HANDLING FUNCTION  =====
// This code was before creating errorController.js file
// app.use((err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';
//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message
//   })
// })

// ====== And this is after creating errorController.js file
app.use(globalErrorHandling);
module.exports = app;
/*
app.all('*', (req, res, next) => {
 return next(new AppError(`can't find ${req.originalUrl} on this server`), 404);
  // 1 ---- First error handling code ----
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find ${req.originalUrl} on this server`
  // })

  // 2 ---- (refactored)Second error handling code ----
  // const err = new Error(`can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // when passing err in the next function then it will skype all the function after it and the code will execute the global error handling function
  //next(err);

  // 3 ---- (refactored) Third error handling code ----
});
*/

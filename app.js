// core modules
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const AppError = require('./utils/appError');
const globalErrorHandling = require('./controllers/errorController');

// Dev modules
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/usersRoutes');

const app = express();
app.use(express.static(`${__dirname}/public`));

//GLOBAL MIDDLEWARES
/*
this can modify the incoming requests
it stands middle of the request and response
*/
const limiter = rateLimit({
  max: 100, // This will limit how many requests are allowed for a given IP address
  windowMs: 1 * 60 * 60 * 1000, // after exceeding the maximum rate limit, this windowMs will all the user to try again after this
                                // period finishes  1 hours * 60 minutes * 60 seconds * 1000 milliseconds, so the whole period is
                                // changed to milliseconds
  message: 'Too many requests, please try again'
})
app.use(express.json());
app.use('/api', limiter)
app.use(morgan('tiny'));
app.use((req, res, next) => {
  // we are manipulating request to add request time property to the req object
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);
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

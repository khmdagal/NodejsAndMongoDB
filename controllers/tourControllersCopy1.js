// ===> this is a copy of tourControllers.js file

const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}./../dev-data/data/tours.json`),
);

const requiredTour = [];
exports.checkID = (req, res, next, value) => {
  const tour = tours.find((el) => el._id === value);
  if (tour) {
    requiredTour.push(tour);
  } else {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (
    !req.body._id ||
    !req.body.name ||
    !req.body.duration ||
    !req.body.price
  ) {
    return res.status(404).json({
      status: 'Bad request',
      message: 'Invalid request',
    });
  }
  next();
};

// ==========  ROUT HANDLERS

// Tours
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedTime: req.requestTime,
    data: {
      tours,
    },
  });
};

exports.postTours = (req, res) => {
  /*
  res.send('done')
  important note: express doesn't put the request body in the req,
  in order to find the body of the request you need to use
  middleware like app.use(express.json())
  */
  const newTour = Object.assign(req.body);

  fs.writeFile(
    `${__dirname}./../dev-data/data/tours.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) {
        console.log(err.message);
        res.status(500).json({
          message: "Can't process your request",
        });
      }
      res.status(201).json({
        message: 'Created new tour😁',
        createdTime: req.requestTime,
        newTour: newTour,
      });
    },
  );
};

exports.getTourById = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedTime: req.requestTime,
    data: {
      requiredTour,
    },
  });
};

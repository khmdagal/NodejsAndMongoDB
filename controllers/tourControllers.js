const Tour = require('../models/tourModel');
const APIFeature = require('../utils/apiFeatures');
// ==========  ROUT HANDLERS

exports.aliasTopTours = (req, res, next) => {
  // this is to create api feature where we want to manipulate the query before it process
  // we can get the top five tours. you change what ever you like
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// exports.checkBody = (req, res, next) => {
//   if (
//     !req.body.name ||
//     !req.body.duration ||
//     !req.body.price ||
//     !req.body.rating
//   ) {
//     return res.status(404).json({
//       status: 'Bad request',
//       message: 'Invalid request',
//     });
//   }
//   next();
// };
// Tours
exports.getAllTours = async (req, res) => {
  try {
    const features = new APIFeature(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;
    res.status(200).json({
      status: 'success',
      result: tours.length,
      requestedTime: req.requestTime,
      data: { tours },
    });
  } catch (error) {
    res.status(404).json({ status: 'failed', message: error });
    console.log(error);
  }
};

exports.postTours = async (req, res) => {
  try {
    // const newTour = new Tour();
    // newTour.save();

    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'Success',
      data: newTour,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id }); // same as above
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 2.5 } },
      },
      {
        $group: {
          // this _id is the field that you want to group by
          _id: { $toUpper: '$difficulty' },
          numTour: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          tours: { $push: '$name' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgRating: -1 },
      }
      // {
      //   $match: { _id: { $ne: 'EASY' } },
      // },
    ]);

    res.status(200).json({
      status: 'success',
      data: { stats },
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    //const [year, month, day] = req.params.year.split('-');
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          requentMonth: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      { $addFields: { month: '$_id' } },
      { $project: { _id: 0 } },
      { $sort: { requentMonth: -1 } }
     // {$limit:3}
    ]);
    console.log(year);
    res.status(200).json({
      status: 'success',
      data: { plan },
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
}


/*
 // Feature 1 = DIFFERENT WAY OF BUILDING QUERY
    /*
    //adding query
    //const tours = await Tour.find({duration: 5,difficulty:"easy"})
    //const tours = await Tour.find(req.query);
    //console.log(req.query)
  

    // here we are distructuring query req.query object and then we want 
    // to delete all the fields in the query that we don't want
    const objectQuery = { ...req.query }
    const exculdedFields = ['page', 'sort', 'limit', 'fields'];
    exculdedFields.forEach((el) => delete objectQuery[el]);

    const tours = await Tour.find(objectQuery);
    console.log(objectQuery)
    
    // Another way of querying
    const tours = await Tour.find()
      .where('duration')
      .equals(5)
      .where('difficulty')
      .equals('easy');


    // Build Query
    // const objectQuery = { ...req.query };
    // const exculdedFields = ['page', 'sort', 'limit', 'fields'];
    // exculdedFields.forEach((el) => delete objectQuery[el]);

    // let query = Tour.find(objectQuery);

    //Feature 3 = Field Limiting
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // } else {
    //   // by adding - sign you are excluding this field to be returned
    //   query = query.select('-__v');
    // }

    // Feature 4 = PAGINATION
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);

    // if the page user requested is not exist to handle the error
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }
    // Execute Query
*/

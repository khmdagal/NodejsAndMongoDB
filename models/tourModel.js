const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxLength: [40, 'A name should have at least 40 character long name'],
      minLength: [10, 'A name should have more than 10 character long name']
      //validate: [validator.isAlpha, 'Tour name must only contain strings'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have max group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty '],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either = easy, medium or difficult'
      }
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      require: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(value) {
          //this key world only works to the current doc on NEW document creation
          return value < this.price; //100 < 200 = true
        },
        message: 'Price ({VALUE}) should be greater then discount'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,

      require: [true, 'A tour must a cover image']
    },
    image: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true }
  }
);

// DOCUMENT MIDDLEWARE: runs before the .sava() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// virtual property
tourSchema.virtual('durationWeeks').get(function() {
  // this will divid the duration field value by 7 in order to
  // determin the how many weeks.
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before the .save() and .create() commands, but not .insertMany()

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre('save', (next) => {
//   console.log('this document ....')
//   next();
// });

// tourSchema.post('save', (doc, next) => {
//   console.log("=====>>>",doc)
//   next();
// })

//QUERY MIDDLEWARE :
/*
if we use only 'find' this middleware will not work on findOne and findAndUpdate methods.
so we can use use a regular expression all the methods that matches find.. this middleware should be executed.
*/
tourSchema.pre(/^find/, function(next) {
  // tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } });

  //we define new property called 'start' on this object
  this.start = Date.now();
  next();
});

// creating post hook
tourSchema.post(/^find/, function(docs, next) {
  console.log(`This query took ${Date.now() - this.start} milliseconds`);
  next();
});

// Aggregation Middleware :

tourSchema.pre('aggregate', function(next) {
  // this middleware we adding a new stage at the
  // beginning of the aggregation pipeline
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

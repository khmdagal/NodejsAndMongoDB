const Review = require('../models/reviewModel');
const catchAsync = require('./../utils/catchAsync')


exports.getAllReviews = catchAsync(async (req, res, next) => {

     const reviews = await Review.find()

        res.status(200).json({
            status: 'Success',
            data: { reviews }
        })
    // try {
       
    // } catch (error) {
    //     console.log(error);
    //     res.status(400).json({
    //         status: 'Failed',
    //         message: error
    //     })
    // }
     
})

exports.postReview = catchAsync(async (req, res, next) => {
      console.log('===>>>',req.body)
        const newReview = await Review.create(req.body);

        res.status(201).json({
            status: 'Success',
            message: 'Post successfully created ✅',
            data: newReview
        })
    // try {
      
    // } catch (error) {
    //     console.log(error);
    //     res.status(400).json({
    //         status: 'Failed',
    //         message: error
    //     })
    // }
    
})
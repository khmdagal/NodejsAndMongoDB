const mongoose = require('mongoose');
const { schema } = require('./userModel');
const { path } = require('../app');

const reviewSchema = mongoose.Schema(
    {
        review:{
            type: String,
            required:[true, 'Review can not be empty']
        },

        rating:{
            type: Number,
            min:1,
            max:10
        },

        createdAt:{
            type: Date,
            default: Date.now
        },

        tour:{
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a Tour.']
        },

        user:{
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a User.']
        }
    },

    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)




reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name'
    }).populate({
        path: 'tour',
        select: 'name'
    })

    next()
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
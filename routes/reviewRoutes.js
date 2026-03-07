const express = require('express');
const {getAllReviews, postReview} = require('../controllers/reviewController');
const {protect}= require('../controllers/authController');

const router = express.Router()

router.route('/').get(protect, getAllReviews);
router.route('/').post(protect, postReview)


module.exports = router
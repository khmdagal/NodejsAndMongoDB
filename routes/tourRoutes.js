const express = require('express');
const {
  getAllTours,
  postTours,
  getTourById,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan
  //checkBody
} = require('../controllers/tourControllers');
const { protect } = require('../controllers/authController');

const router = express.Router();
//router.param('id', checkID);

router.route('/get-top5-cheap-tours').get(aliasTopTours);

router.route('/tour-stats').get(getTourStats);

router.route('/monthly-plan/:year').get(getMonthlyPlan);

router
  .route('/')
  .get(protect, getAllTours)
  .post(postTours);

router
  .route('/:id')
  .get(getTourById)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;

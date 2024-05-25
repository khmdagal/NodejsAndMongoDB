const express = require('express');

const router = express.Router();

const {
  getAllUsers
  //postUsers,
  //getUsersById,
} = require('../controllers/userControllers');

const { signUp, login, forgetPassword, resetPassword, updatePassword, protect } = require('../controllers/authController');

// singing up rout

router.route('/signup').post(signUp);
// login in
router.route('/login').post(login)
router.route('/forgetPassword').post(forgetPassword);
router.route('/resetPassword/:token').patch(resetPassword);
router.route('/updateMyPassword').patch(protect, updatePassword)
router.route('/').get(getAllUsers); 
//router.route('/:id').get(getUsersById);

module.exports = router;

const express = require('express');

const router = express.Router();

const {
  getAllUsers,
  updateUserData,
  deleteUser
  //postUsers,
  //getUsersById,
} = require('../controllers/userControllers');

const { signUp, login, forgetPassword, resetPassword, updatePassword, protect } = require('../controllers/authController');

//====Authentication routes 
router.route('/signup').post(signUp);
router.route('/login').post(login)
router.route('/forgetPassword').post(forgetPassword);
router.route('/resetPassword/:token').patch(resetPassword);
router.route('/updateMyPassword').patch(protect, updatePassword)

// ===== Update some of the user data
router.route('/updateUserData').patch(protect, updateUserData)
router.route('/deleteUser').delete(protect, deleteUser)
router.route('/').get(protect, getAllUsers); 
//router.route('/:id').get(getUsersById);

module.exports = router;

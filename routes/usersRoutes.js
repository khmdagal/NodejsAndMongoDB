const express = require('express');

const router = express.Router();

const {
  getAllUsers
  //postUsers,
  //getUsersById,
} = require('../controllers/userControllers');

const { signUp, login, forgetPassword } = require('../controllers/authController');

// singing up rout

router.route('/signup').post(signUp);
// login in
router.route('/login').post(login)
router.route('/forgetPassword').post(forgetPassword); //.post(singUp);

router.route('/').get(getAllUsers); //.post(postUsers);
//router.route('/:id').get(getUsersById);

module.exports = router;

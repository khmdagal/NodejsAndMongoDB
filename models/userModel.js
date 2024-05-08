const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: ['user must have a name'],
  },
  email: {
    type: String,
    isEmail: true,
    required: [true, 'user should have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid eamil'],
  },
  role: {
    type: String,
    //required: [true, 'A user must have a role'],
    enum: {
      values: ['Admin', 'driver', 'staff', 'customer'],
    },
  },
  photo: String,
  password: {
    type: String,
    required: true,
    minLength: 8,
    select: false, // this will hid the password when users and inquired
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password must be same',
    },
  },
});

userSchema.pre('save', async function (next) {
  // 1 first we need to check if the password is modified
  // !this.isModified('password')
  if (!this.isModified('password')) next();
  // one important thing to rememeber is bycrypt.hash() will return promise
  // you need to use await key word
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

// We are using the instance method to check if the entered password matches the original password that
// where hashed and store the database
// initially we used to bcrypt to sulte and hash the password and now we are using same algorithm
// This method will be available all the fields for certain collections

// userSchema.methods.correctPassword = async function (
//   enteredPassword,
//   userPassword,
// ) {
//   // VERY IMPORTANT THIS FUNCTION IS INSTANT AND AVAILABLE ALL THE USER DOCUMENTS, YOU CAN CALL IT INT THE USER CONTROLLER FILES
//   // the goal of this function is to return true or false
//   // if the password matches = TRUE if not FALSE

//   return await bcrypt.compare(enteredPassword, userPassword);
// };

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  const correct = await bcrypt.compare(candidatePassword, userPassword);
  return correct;
};
const User = mongoose.model('User', userSchema);

module.exports = User;

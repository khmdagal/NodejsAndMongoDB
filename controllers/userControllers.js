// core modules
// const fs = require('fs');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    requestedTime: req.requestTime,
    data: {
      users
    }
  });
  next();
});
// exports.postUsers = (req, res) => {
//   const newUser = Object.assign(req.body);
//   users.push(newUser);

//   fs.writeFile(
//     `${__dirname}/dev-data/data/users.json`,
//     JSON.stringify(users),
//     (err) => {
//       if (err) {
//         console.log(err.message);
//         res.status(500).json({
//           message: "Can't process your request",
//         });
//       }
//       res.status(201).json({
//         message: 'Created new user 🙋‍♂️',
//         createdTime: req.requestTime,
//         newUser: newUser,
//       });
//     },
//   );
// };
// exports.getUsersById = (req, res) => {
//   const { id } = req.params;
//   const user = users.find((el) => el._id === id);
//   if (!user) {
//     res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }

//   res.status(200).json({
//     status: 'success',
//     requestedTime: req.requestTime,
//     data: {
//       user,
//     },
//   });
// };

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el)) newObj[el] = obj[el]
  }) 
  return newObj
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  return res.status(200).json({
    status: 'success',
    requestedTime: req.requestTime,
    data: {
      users
    }
  });
 
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  // 1 Create error if user post password data
  if (req.body.password || req.body.passwordConfirm) {
   return next(new AppError('Your are not allowed to change password in the route', 400))
  }
  // 2 filter user input fields
  //== This second step is not to allow the user to have the ability to change every field they want
  const filteredBody = filterObj(req.body, 'email', 'name');
  // 3 Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    status: "success",
    data: updatedUser
  })


})



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

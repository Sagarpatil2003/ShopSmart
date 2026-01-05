const express = require('express')
const authMiddleware = require('../middlewares/authMiddlewares');
const UserRoute = express.Router()
const { 
   userSignUp,
   loginUser, 
   forgetPassword, 
   resetPassword, 
   getUser, 
   updateUserProfile, 
   orderHistory 
} = require('../controllers/userControllers');


UserRoute.post('/signup', userSignUp)

UserRoute.post('/login', loginUser)

UserRoute.post('/forget-password', forgetPassword);

UserRoute.post('/reset-password', resetPassword);



module.exports = UserRoute
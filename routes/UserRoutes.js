const express = require('express');
const router = express.Router();
const userService = require('../services/UserService');
const userController = require('../controllers/UserController');
const passport = require('../lib/passport/index');

//#logIn
router.post('/logIn', [
    userService.validateLogIn,
    userService.findUser,
    userService.generateTokenForFoundUser,
    userService.logIn,
    userController.logInData
]);

//#register
router.post('/register', [
    userService.validateRegister,
    userService.verifyRegistrationCaptcha,
    userService.findUserByUsername,
    userService.generateTokenForUser,
    userService.register,
    userController.registerData
]);

//#getCurrentUser
router.post('/getCurrentUser', [passport], [
    userService.getCurrentUser,
    userController.getCurrentUserData
]);

//#getById
router.post('/getById', [passport], [
    userService.findOneUser,
    userController.findOneUserData
]);

//#update
router.put('/update', [passport], [
    userService.updateUser,
    userController.updateUserData
]);

//#resetPassword
router.post('/user/resetPassword', [
    userService.findUserByEmail,
    userService.sendEmail,
    userService.resetUserPassword,
    userController.resetUserPasswordData
]);

//#getAllForTableAffiliates
router.post('/user/getAllForAffiliatesTable', [passport], [
    userService.getAllForAffiliatesTable,
    userController.getAllForAffiliatesTableData
]);

//#update
router.put('/user/update', [passport], [
    userService.updateUserByadmn,
    userController.updateUserByadmnData
]);

//# delete user
router.delete('/user/Delete/:_id', [
    userService.deleteUserByadmn,
    userController.deleteUserByadmnData
]);

module.exports = router;
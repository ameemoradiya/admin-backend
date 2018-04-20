'use strict';

const express = require('express');
const router = express.Router();
const userService = require('../services/UserService');
const userController = require('../controllers/UserController');
const passport = require('../lib/passport/index');
const multer = require('multer');
let storage = multer.diskStorage({ // multers disk storage settings
  'destination': function (req, file, cb) {
    cb(null, './public/assets/profilePhotos');
  },
  'filename': function (req, file, cb) {
    let extArray = file.mimetype.split('/');
    let extension = extArray[extArray.length - 1];
    
    cb(null, `${file.fieldname} - ${Date.now()} ${extension}`);
  }
});
let upload = multer({
  'storage': storage
});

// #logIn
router.post('/logIn', [
  userService.validateLogIn,
  userService.findUser,
  userService.logIn,
  userController.logInData
]);

// #register
router.post('/register', [
  userService.validateRegister,
  userService.verifyRegistrationCaptcha,
  userService.findUserByName,
  userService.generateTokenForUser,
  userService.register,
  userService.sendEmailUserReg,
  userController.registerData
]);

// #getCurrentUser
router.post('/getCurrentUser', [ passport ], [
  userService.getCurrentUser,
  userController.getCurrentUserData
]);

// #getById
router.post('/getById', [ passport ], [
  userService.findOneUser,
  userController.findOneUserData
]);

// #update
router.put('/update', [ passport ], [
  userService.updateUser,
  userService.sendEmailProfileUpdate,
  userController.updateUserData
]);

// #add
router.post('/uploadImage/upload', upload.single('file'), [ passport ], [
  userService.validateAddProPhoto,
  userService.addProfilePhoto,
  userController.addProfileData
]);

// #deletebyId
router.put('/uploadImage/delete/:id', [ passport ], [
  userService.deleteProfilePhoto,
  userController.deleteProfileData
]);

module.exports = router;

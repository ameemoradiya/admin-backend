'use strict';

const express = require('express');
const router = express.Router();
const userService = require('../../services/UserService');
const userController = require('../../controllers/UserController');
const passport = require('../../lib/passport/index');

// #resetPassword
router.post('/resetPassword', [
  userService.findUserByEmail,
  userService.resetUserPassword,
  userService.sendEmailResetPass,
  userController.resetUserPasswordData
]);

// #getAllForTableAffiliates
router.post('/getAllForAffiliatesTable', [ passport ], [
  userService.getAllForAffiliatesTable,
  userController.getAllForAffiliatesTableData
]);

// #update
router.put('/update', [ passport ], [
  userService.updateUserByadmn,
  userController.updateUserByadmnData
]);

// # delete user
router.delete('/Delete/:_id', [ passport ], [
  userService.deleteUserByadmn,
  userController.deleteUserByadmnData
]);

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();
const fbTaskService = require('../../services/FirebaseTaskService');
const fbTaskController = require('../../controllers/FirebaseTaskController');
const passport = require('../../lib/passport/index');


// taskSet
router.post('/TaskSet', [ passport ], [
  fbTaskService.taskset,
  fbTaskController.addedTaskData
]);

// Get all task
router.post('/getAll', [ passport ], [
  fbTaskService.getAll,
  fbTaskController.fbTaskData
]);

// delete task by Id
router.delete('/delete/:key', [ passport ], [
  fbTaskService.delete,
  fbTaskController.deletefbTaskData
]);

// delete task by Id
router.put('/update/:key', [ passport ], [
  fbTaskService.updateTask,
  fbTaskController.updatefbTaskData
]);

module.exports = router;

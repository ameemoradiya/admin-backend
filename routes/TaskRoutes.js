const express = require('express');
const router = express.Router();
const taskService = require('../services/TaskService');
const taskController = require('../controllers/TaskController');
const passport = require('../lib/passport/index');


//# Add newtask
router.post('/TaskSet', [passport], [
    taskService.findTaskByTaskname,
    taskService.taskSet,
    taskController.TaskData
]);

//# GetAll tasklist
router.post('/getAll', [passport], [
    taskService.getAll,
    taskController.getAllTaskData
]);

//# update task
router.put('/Update/:task_id', [passport], [
    taskService.validateUpdateTask,
    taskService.updateTask,
    taskController.updateTaskData

]);

//# delete task
router.delete('/Delete/:task_id', [passport], [
    taskService.deleteTask,
    taskController.deleteTaskData
]);

//# update for complete task
router.put('/Complete/:task_id', [passport], [
    taskService.validateCompleteTask,
    taskService.taskComplete,
    taskController.updateTaskData
]);

module.exports = router;
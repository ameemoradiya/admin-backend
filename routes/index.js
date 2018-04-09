const express = require('express');
const router = express.Router();

const tasks = require('../models/task');
const bookstore = require('../models/bookstore');

/* Set Route file */
const task = require('../routes/TaskRoutes');
const bstore = require('../routes/BookStoreRoutes');
const UserRoutes = require('../routes/UserRoutes');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//# TaskRoutes Route
router.use('/tasks', task);

//# BookRoutes Route
router.use('/books', bstore);

//# UserRoutes Route
router.use('/user', UserRoutes);

//# UserRoutes Route
router.use('/admin', UserRoutes);

module.exports = router;

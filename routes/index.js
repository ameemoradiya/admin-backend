'use strict';

const express = require('express');
const router = express.Router();

/* Set Route file */
const task = require('../routes/TaskRoutes');
const bstore = require('../routes/BookStoreRoutes');
const UserRoutes = require('../routes/UserRoutes');


/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { 'title': 'Express' });
});

// # TaskRoutes Route
router.use('/task', task);

// # BookRoutes Route
router.use('/books', bstore);

// # UserRoutes Route
router.use('/user', UserRoutes);

module.exports = router;

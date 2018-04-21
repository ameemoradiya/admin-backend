'use strict';

const express = require('express');
const router = express.Router();

/* Set Route file */
const fbTask = require('../../routes/firebaseTask/firebaseTaskRoutes');

// # TaskRoutes Route
router.use('/tasks', fbTask);

module.exports = router;

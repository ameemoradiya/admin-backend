'use strict';

const express = require('express');
const router = express.Router();

/* Set Route file */
const user = require('../../routes/admin/userRoutes');

// # user Route
router.use('/user', user);

module.exports = router;

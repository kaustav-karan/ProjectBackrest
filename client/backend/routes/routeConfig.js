// All route configurations are defined here
// This file is used by the server to configure the routes
// and the corresponding controllers

const express = require('express');
const router = express.Router();

const rootRoute = require('./rootRoute/route');
const frontEndRoute = require('./frontEndRoute/route');
const seedRoute = require('./seedRoute/route');

router.use('/', rootRoute);
router.use('/frontEnd', frontEndRoute);
router.use('/seed', seedRoute);

module.exports = router;
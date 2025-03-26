const express = require('express');
const router = express.Router();

const rootRoute = require('./rootRoutes/route');

router.use('/', rootRoute);
router.use("/peer", require("./peerRoutes/route"));
router.use("/server", require("./serverRoutes/route"));

module.exports = router;
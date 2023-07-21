const express = require('express');
const router = express.Router();
const refreshTokenController = require('../controllers/users/refreshTokenController');
const {  authRefresh } = require('../middlewares/auth');

router.get('/', authRefresh, refreshTokenController.handleRefreshToken);

module.exports = router;

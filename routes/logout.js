const express = require('express');
const router = express.Router();
const logoutController = require('../controllers/users/logoutController');
const { authRefresh } = require('../middlewares/auth');

router.get('/', authRefresh, logoutController.handleLogout);

module.exports = router;

const express = require('express');
const router = express.Router();
const loginController = require('../controllers/users/loginController');

router.post('/', loginController.handleLogin);

module.exports = router;

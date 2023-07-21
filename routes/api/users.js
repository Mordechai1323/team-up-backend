const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/users/usersController');
const { auth, authAdmin } = require('../../middlewares/auth');

router.route('/').get(auth, usersController.getMyInfo).put(auth, usersController.editUserDetails).delete(auth, usersController.deleteUser);

router.route('/myInfo').get(auth, usersController.getMyInfo);
router.route('/allUsers').get(authAdmin, usersController.getAllUsers);
router.route('/count').get(authAdmin, usersController.count);
router.route('/editPassword').put(auth, usersController.editPassword);
router.route('/changeRole').patch(authAdmin, usersController.getMyInfo);

module.exports = router;

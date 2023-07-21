import express from 'express';
const router = express.Router();
import usersController from'../../controllers/users/usersController'
import { auth, authAdmin } from'../../middleware/auth'

router.route('/').get(auth, usersController.getMyInfo).put(auth, usersController.editUserDetails).delete(auth, usersController.deleteUser);

router.route('/myInfo').get(auth, usersController.getMyInfo);
router.route('/allUsers').get(authAdmin, usersController.getAllUsers);
router.route('/count').get(authAdmin, usersController.count);
router.route('/editPassword').put(auth, usersController.editPassword);
router.route('/changeRole').patch(authAdmin, usersController.getMyInfo);

export = router;

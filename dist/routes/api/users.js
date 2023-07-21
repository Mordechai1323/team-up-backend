"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const usersController_1 = __importDefault(require("../../controllers/users/usersController"));
const auth_1 = require("../../middleware/auth");
router.route('/').get(auth_1.auth, usersController_1.default.getMyInfo).put(auth_1.auth, usersController_1.default.editUserDetails).delete(auth_1.auth, usersController_1.default.deleteUser);
router.route('/myInfo').get(auth_1.auth, usersController_1.default.getMyInfo);
router.route('/allUsers').get(auth_1.authAdmin, usersController_1.default.getAllUsers);
router.route('/count').get(auth_1.authAdmin, usersController_1.default.count);
router.route('/editPassword').put(auth_1.auth, usersController_1.default.editPassword);
router.route('/changeRole').patch(auth_1.authAdmin, usersController_1.default.getMyInfo);
module.exports = router;

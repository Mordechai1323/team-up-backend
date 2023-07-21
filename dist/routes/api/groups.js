"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const groupsController_1 = __importDefault(require("../../controllers/boards/groupsController"));
const auth_1 = require("../../middleware/auth");
router
    .route('/')
    .get(auth_1.auth, groupsController_1.default.getGroups)
    .post(auth_1.auth, groupsController_1.default.addGroup)
    .put(auth_1.auth, groupsController_1.default.editGroup)
    .delete(auth_1.auth, groupsController_1.default.deleteGroup);
router.route('/searchGroups').get(auth_1.auth, groupsController_1.default.searchGroups);
router.route('/changeIsOpen').post(auth_1.auth, groupsController_1.default.changeIsOpen);
module.exports = router;

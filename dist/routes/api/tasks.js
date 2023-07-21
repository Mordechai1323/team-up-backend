"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const tasksController_1 = __importDefault(require("../../controllers/boards/tasksController"));
const auth_1 = require("../../middleware/auth");
router
    .route('/')
    .get(auth_1.auth, tasksController_1.default.getTasks)
    .post(auth_1.auth, tasksController_1.default.addTask)
    .put(auth_1.auth, tasksController_1.default.editTask)
    .delete(auth_1.auth, tasksController_1.default.deleteTask);
router.route('/addInCare').post(auth_1.auth, tasksController_1.default.addInCare);
router.route('/deleteInCare').post(auth_1.auth, tasksController_1.default.deleteInCare);
router.route('/changeStatus').put(auth_1.auth, tasksController_1.default.changeStatus);
module.exports = router;
